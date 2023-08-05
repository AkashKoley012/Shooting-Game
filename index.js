const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEle = document.querySelector('#score');
const startGameBtn = document.querySelector('#startGameBtn');
const modal = document.querySelector('#modal');
const modalScore = document.querySelector('#modal-score');

let player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEle.innerHTML = score;
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
            x = Math.random() * canvas.width;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}
let animateId;
let score = 0;
function animate() {
    animateId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particle.update();
        }
    });

    // draw all the projectile on screen
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();
        // remove projectile form projectiles
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0);
        }
    });

    //! draw all the enemies on screen
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        // end game
        if (dist - enemy.radius - player.radius < 0) {
            cancelAnimationFrame(animateId);
            modalScore.innerHTML = score;
            modal.style.display = 'flex';
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );
            // when projectile touch enemy
            if (dist - projectile.radius - enemy.radius < 1) {
                // create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6),
                            }
                        )
                    );
                }
                // using set timeout for remove the flash effect
                if (enemy.radius - 10 > 5) {
                    // increase out score
                    score += 100;
                    scoreEle.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10,
                    });
                    setTimeout(() => {
                        // remove projectile form projectiles
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    // increase out score
                    score += 250;
                    scoreEle.innerHTML = score;
                    setTimeout(() => {
                        // remove enemy form enemies
                        enemies.splice(enemyIndex, 1);
                        // remove projectile form projectiles
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}
