import { Player } from './Player.js';
import { Invaders } from './Invaders.js';
import { collision } from './Collision.js';
import { Projectile } from './Projectile.js';

class GameEngine {
  canvas = null;
  ctx = null;
  items = [];
  player = null;
  invader = null;
  hasCollision = false;
  projectiles = [];

  keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  };

  speed = 5;
  invadersSpeed = 6;

  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.invader = new Invaders();
    this.player = new Player();
    this.player.x = this.canvas.width / 2 - this.player.getImg().width / 2;
    this.player.y = this.canvas.height - this.player.getImg().height;
  }

  init() {
    this.initEvent();
    this.generateInvaders();
  }

  generateInvaders() {
    let count = 20;
    let invaderHeight = this.invader.height;
    let espacement = invaderHeight * 2;

    for (let i = 0; i < count; i++) {
      let newInvader = new Invaders(
        Math.random() * (this.canvas.width - this.invader.width),
        -50 - i * espacement,
        Math.random() < 0.5 ? -1 : 1,
        0.5
      );
      this.items.push(newInvader);
    }
  }

  moveInvaders() {
    for (let invader of this.items) {
      // vérifier s'l y a collision par défaut collision=false
      if (!invader.hasCollision) {
        // permet d'établir la vitesse de déplacement horizontale
        invader.x += invader.directionX * this.invadersSpeed;
        // permet d'établir la vitesse de descente verticale
        invader.y += (invader.directionY * this.invadersSpeed) / 3;
        // vérif si les bords sont touchés si oui la direction du déplacement est inversée avec *-1
        if (invader.x <= 0 || invader.x + invader.width >= this.canvas.width) {
          invader.directionX *= -1;
        }
        if (invader.y + invader.height > this.canvas.height) {
          invader.y = this.canvas.height - invader.height;
          this.invadersSpeed = 0;
          this.gameOver('La Terre a été envahie !!!');
        }
        // va permettre la collision de chaque élément du tableau
        if (collision(this.player, invader)) {
          console.log("Before decrement", this.player.lives)
          if (this.player.lives > 0) {
            invader.hasCollision = true;
            this.hasCollision = true;
            --this.player.lives;
            console.log("After decrement", this.player.lives)
          } else if (this.player.lives <= 0) {
            console.log("Game over case", this.player.lives)
            invader.hasCollision = false;
            this.hasCollision = false;
            this.gameOver("Tu n'as plus de vies !");
          }
        }
      }
    }
  }

  initEvent() {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case ' ':
          this.keys.space = true;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case ' ':
          this.keys.space = false;
          this.newProjectile();
          break;
      }
    });
  }

  newProjectile = () => {
    const projectile = new Projectile(null, null);

    // Pour chaque projectile, on initialise correctement les valeurs pour que le point de depart soit le milieu du vaisseau
    projectile.x =
      this.player.x +
      this.player.getImg().width / 2 -
      projectile.getImg().width / 2;

    projectile.y = this.player.y;
    this.projectiles.push(projectile);

    // Check for collision with player
    if (collision(this.player, projectile)) {
      if (this.player.lives > 0) {
        projectile.hasCollision = true;
        this.hasCollision = true;
        --this.player.lives;
      } else {
        projectile.hasCollision = false;
        this.hasCollision = false;
        this.gameOver("Tu n'as plus de vies !");
      }
    }
  }

  update() {
    let prevX = this.player.x;
    let prevY = this.player.y;

    if (this.keys.left) {
      this.player.x -= this.speed;
    }
    if (this.keys.right) {
      this.player.x += this.speed;
    }

    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.y + projectile.getImg().height > 0
    );
    for (let projectile of this.projectiles) {
      projectile.y -= 1;
    }

    // if (this.collisionItem()) {
    //     this.player.x = prevX
    //     this.player.y = prevY
    // }

    this.collisionBorder();
    if (this.moveInvaders()) {
      this.player.x = prevX;
      this.player.y = prevY;
    }
  }

  collisionBorder() {
    if (this.player.x < 0) {
      this.player.x = 0;
    }
    if (this.player.y < 0) {
      this.player.y = 0;
    }
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let item of this.items) {
      this.ctx.drawImage(
        item.getImg(),
        item.x,
        item.y,
        item.width,
        item.height
      );
    }
    this.drawNewProjectile();
    this.drawLives();
  }

  drawNewProjectile() {
    this.projectiles.forEach((projectile) => {
      this.ctx.drawImage(projectile.getImg(), projectile.x, projectile.y);
    });
    this.ctx.drawImage(this.player.getImg(), this.player.x, this.player.y);
  }

  drawLives() {
    const lives = document.getElementById('lives');
    lives.innerText = `Vies: ${this.player.lives}`;
  }

  gameLoop() {
    this.update();
    this.draw();
    window.requestAnimationFrame(() => {
      this.gameLoop();
    });
  }

  run() {
    this.init();
    this.gameLoop();
    // let count = 0;
    // for (let projectile of this.projectiles) {
    //   projectile.loaded(() => {
    //       this.gameLoop();
    //   });
    // }

    // this.projectile.loaded(() => {
    //   this.gameLoop();
    // });
    // this.player.loaded(() => {
    //   this.gameLoop();
    // });
  }

  gameOver(contentMenu) {
    document.getElementById('titleMenu').innerText = 'GAME OVER';
    document.getElementById('contentMenu').innerText = contentMenu;
    document.getElementById('startBtn').innerText = 'Restart the Game';
    document.getElementById('menu').style = 'display: flex';

    // TODO: resetGame, à conserver ? Cf. Benjamin
    // Reset the game
    this.resetGame();
  }

  // TODO: resetGame, à conserver ? Cf. Benjamin
  resetGame() {
    // Reset player's lives
    this.player.lives = 3;

    // Clear invaders and projectiles
    this.items = [];
    this.projectiles = [];

    // Reset game state variables as needed
    this.hasCollision = false;
  }

}

export { GameEngine };
