/**
 * AstGame
 *          Main global class for Asteroids Game
 *
 *          Implemented as global object AstGameInst (like a singleton)
 */
 
class AstGame
{
    constructor()
    {
        this.frameCount = 0;
        this.stateMachine = new StateMachine();
        this.ship = new Ship();
        this.explosionManager = new ExplosionManager();

        //Array of current rocks
        this.rockList = [];

        //number of ships
        this.ships = 0;
    }
    
    oneTimeInit()
    {
        GAZCanvas.referenceScreenSize = new Size(1600,900);
        
        this.stateMachine.addState(GameState_Test.label(), new GameState_Test());
        this.stateMachine.addState(GameState_Attract.label(), new GameState_Attract());
        this.stateMachine.addState(GameState_StartGame.label(), new GameState_StartGame());
        this.stateMachine.addState(GameState_CreateWave.label(), new GameState_CreateWave());
        this.stateMachine.addState(GameState_PlaceShip.label(), new GameState_PlaceShip());
        this.stateMachine.addState(GameState_Play.label(), new GameState_Play());
        this.stateMachine.addState(GameState_EndOfWave.label(), new GameState_EndOfWave());
        this.stateMachine.addState(GameState_GameOver.label(), new GameState_GameOver());
    
        this.stateMachine.setState(GameState_Attract.label());
    }

    GetRandomY()
    {
        return Math.random() *1000;
    }

    GetRandomX()
    {
        return Math.random() *2000;
    }

    createRocks()
    {
        //populate the rocklist with an initial set of medium sized rocks and give them a random position on the canvas
        let i
        this.rockList = [];
        for (i = 0; i < 40; i++)
        {
            let rock = new Rock();
            rock.init(new Vector2(this.GetRandomX(), this.GetRandomY()), 'big', new Vector2(0, 1));
            this.rockList.push(rock)
        }
    }

    // provide the player 3 ships these will appear as lives
    resetScore()
    {
        this.ships = 3;
    }

    // Place the ship and make sure its invisible for a few seconds at the beginning
    placeShip()
    {
        this.ship.init();
        this.ship.active = true;
        this.ship.setInvincible();
    }

    // Explode the rocks on impact
    explodeRock(rock)
    {
        this.explosionManager.add(rock);
        rock.active = false;

        if(rock.size ==='big')
        {
            let i;
            for(i=0;i<7;i++)
            {
                let newRock = new Rock();
                this.rockList.push(newRock);
                newRock.initFromRock(rock);
            }

        }
    
        if(rock.size ==='med')
        {
            let i;
            for(i=0;i<5;i++)
            {
                let newRock = new Rock();
                this.rockList.push(newRock);
                newRock.initFromRock(rock);
            }

        }

    }

    update()
    {

        // Check to see if ship has collided with any rocks
        for(let i=0; i<this.rockList.length;i++)
        {
    
            if( (this.rockList[i].active === true)
                &&(this.ship.active === true)
                &&(this.ship.isInvincible() === false)
            )

            {
                if(this.ship.collides(this.rockList[i]) === true)
                {
                    this.explodeRock(this.rockList[i]);
                    
                    this.explosionManager.add(this.ship);
                    this.ship.active = false;
                    this.ships--;
                }
            }
        }
        
        //do updates
        if(this.ship.active === true)
        {
            this.ship.update();
        }
    
        this.rockList.forEach(function(element)
        {
            element.update();
        });
        
        /*
            Update the rock lists.
            
            To do this, go through the current list and copy items to the newlist if they are active.
            Then assign the newlist back to the src rock list
         */

        let newlist = [];

        newlist = [];

        for(let i=0; i<this.rockList.length;i++)
        {
            if(this.rockList[i].active === true)
            {
                newlist.push(this.rockList[i]);
            }
        }
    
        this.rockList = newlist;
    
        //update explosions
        this.explosionManager.update();
    }

    // Draw the canvas, ship and rocks
    draw()
    {
        GAZCanvas.Rect(new Rect(0, 0, 1600, 900),'#ffffff');
    
        this.explosionManager.draw();
    
        if(this.ship.active === true)
        {
            this.ship.draw();
        }
        
        this.rockList.forEach(function(element)
        {
            element.draw();
        });

        
        if(this.stateMachine.currentState !== GameState_Attract.label())
        {
            GAZCanvas.Text(30, "LIVES:"+this.ships,new Vector2(200,60),'#000000','right','Archivo Black');
        }
    }

    /*
        Run() - Game for asteroids
     */
    
    
    Run()
    {
        //do oneTimeInit once
        AstGameInst.oneTimeInit();
        
        setInterval(function()
        {
            //on each frame ...
            
            /*
                GAZCanvas.update() -    this does the reactive canvas functionality
                                        and needs to be called at the beginning of each
                                        update()
             */
            GAZCanvas.update();
            
            /*
                Input.update() -    Update system inputs (mouse, keyboard).
                                    Needs to be called each frame
             */
            Input.update();
            
            AstGameInst.frameCount+= 1;
            
            //do state machine update
            AstGameInst.stateMachine.update();
            
            //clear screen for drawing
            let letterboxColour = 'rgb(32,32,32)';
            Canvas.Rect(new Rect(0, 0, window.innerWidth, window.innerHeight),letterboxColour);
    
            //do state machine draw
            AstGameInst.stateMachine.draw();
    
            //draw the letterbox over the screen to hide any overdraw
            GAZCanvas.drawLetterbox(letterboxColour);
        },17);
    }
}

AstGameInst = new AstGame();