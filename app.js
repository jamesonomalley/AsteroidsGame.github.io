const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreElement = document.querySelector('#scoreElement')
const highScoreElement = document.querySelector('#highScoreElement')
const moneyElement = document.querySelector('#moneyElement')
const startGameButton = document.querySelector('#startGameButton')
const modalElement = document.querySelector('#modalElement')
const modalScoreElement = document.querySelector('#modalScoreElement')
const pauseModalElement = document.querySelector('#pauseModalElement')
pauseModalElement.style.display = 'none'
const purchaseFasterButton = document.querySelector('#purchaseFasterButton')
const doneButton = document.querySelector('#doneButton')
const fasterProjectilePrice = document.querySelector('#fasterProjectilePrice')
const shotgunSpreadPrice = document.querySelector('#shotgunSpreadPrice')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    money = 0
    scoreElement.innerHTML = score
    modalScoreElement.innerHTML = score
    moneyElement.innerHTML = money
    clearEnemies()
    context.clearRect(0, 0, canvas.width, canvas.height);
}

var enemyCount = 0
var enemyCountLimit = 10
var paused = false
var spawner
function spawnEnemies() {
    spawner = setInterval(() => {
            const radius = Math.random() * (30 - 7) + 7
            let x
            let y
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
                y = Math.random() * canvas.height
            }
            else {
                x = Math.random() * canvas.width
                y = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            }
            const color = `hsl(${Math.random() * 360}, 50%, 50%)`
            const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
            const velocity = {x: Math.cos(angle), y: Math.sin(angle)}
            if (enemyCount != enemyCountLimit) {
                enemies.push(new Enemy(x, y, radius, color, velocity)) 
                enemyCount++             
            }
            else {
                clearEnemies() 
                paused = true       
            }                
    }, 1000)    
}

function clearEnemies() {
    clearInterval(spawner)
}

let animationId
let score = 0
let money = 0
let highScore = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    context.fillStyle = 'rgba(0, 0, 0, 0.1)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        }
        else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
           setTimeout(() => {
            projectiles.splice(index, 1)
           }, 0)
        }
    })

    enemies.slice().forEach((enemy, enemyIndex) => {
        enemy.update()

        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // end game
        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modalElement.style.display = 'flex'
            modalScoreElement.innerHTML = score
            if (score > highScore) {
                highScore = score
                highScoreElement.innerHTML = score
            }
            startGameButton.innerHTML = "Play Again"
        }
        projectiles.slice().forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // when projectiles touch enemy
            if (distance - enemy.radius - projectile.radius < 1) {              

                // create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6), 
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }
                    ))
                }

                if (enemy.radius - 10 > 5) {

                    // increase score
                    score += 100
                    money += 12
                    scoreElement.innerHTML = score
                    moneyElement.innerHTML = money
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(projectileIndex, 1)
                }
                else {
                    // remove from canvas altogether
                    // increase score
                    score += 250
                    money += 37
                    scoreElement.innerHTML = score
                    moneyElement.innerHTML = money
                    enemies.splice(enemyIndex, 1)
                    console.log("Enemies inside array: " + enemies.length)
                    projectiles.splice(projectileIndex, 1)
                    if (enemies.length == 0 && paused == true) { 
                        setTimeout(() => {
                            cancelAnimationFrame(animationId)                       
                            pauseModalElement.style.display = 'flex' 
                        }, 2000)                        
                    } 
                }
            }
        })
    })
}

var projectileSpeed = 3
var shotgunBought = false
var shotgunUpgraded = 0
var projectileUpgraded = 0
var projectilePrice = 300
var shotgunPrice = 1000
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {x: Math.cos(angle) * projectileSpeed, y: Math.sin(angle) * projectileSpeed}
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
    )

    if (shotgunBought == true) {
        const angle2 = Math.atan2(event.clientY - canvas.height / 1.9, event.clientX - canvas.width / 2)
        const velocity2 = {x: Math.cos(angle2) * projectileSpeed, y: Math.sin(angle2) * projectileSpeed}
        projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity2)
        ) 
        const angle3 = Math.atan2(event.clientY - canvas.height / 2.1, event.clientX - canvas.width / 2)
        const velocity3 = {x: Math.cos(angle3) * projectileSpeed, y: Math.sin(angle3) * projectileSpeed}
        projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity3)
        ) 
        if (shotgunUpgraded == 2) {
            const angle2 = Math.atan2(event.clientY - canvas.height / 1.7, event.clientX - canvas.width / 2)
            const velocity2 = {x: Math.cos(angle2) * projectileSpeed, y: Math.sin(angle2) * projectileSpeed}
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity2)
            ) 
            const angle3 = Math.atan2(event.clientY - canvas.height / 2.3, event.clientX - canvas.width / 2)
            const velocity3 = {x: Math.cos(angle3) * projectileSpeed, y: Math.sin(angle3) * projectileSpeed}
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity3)
            ) 
        }
    }
})

startGameButton.addEventListener('click', () => {
    init()
    modalElement.style.display = 'none'
    pauseModalElement.style.display = 'none'
    animate()
    spawnEnemies()
})

purchaseFasterButton.addEventListener('click', () => {
    if (money > projectilePrice) {
        fasterProjectilePrice.innerHTML = "$" + projectilePrice
        money -= projectilePrice
        moneyElement.innerHTML = money
        projectileSpeed += 1.5
        purchaseFasterButton.innerHTML = "Purchased!"
        purchaseFasterButton.style.backgroundColor = "green" 
        purchaseFasterButton.disabled = true
        projectileUpgraded++
        projectilePrice *= 2
    }
    else {
        purchaseFasterButton.innerHTML = "Insufficient Funds!"
        purchaseFasterButton.style.backgroundColor = "red" 
        purchaseFasterButton.disabled = true
    }
})

purchaseSpreadButton.addEventListener('click', () => {
    if (money > shotgunPrice) {
        shotgunSpreadPrice.innerHTML = "$" + shotgunPrice
        money -= shotgunPrice
        shotgunBought = true
        moneyElement.innerHTML = money
        purchaseSpreadButton.innerHTML = "Purchased!"
        purchaseSpreadButton.style.backgroundColor = "green" 
        purchaseSpreadButton.disabled = true
        shotgunUpgraded++
        shotgunPrice *= 2
    }
    else {
        purchaseSpreadButton.innerHTML = "Insufficient Funds!"
        purchaseSpreadButton.style.backgroundColor = "red" 
        purchaseSpreadButton.disabled = true
    }
})

doneButton.addEventListener('click', () => {
    pauseModalElement.style.display = 'none'
    paused = false
    if (purchaseFasterButton.disabled == true) {
        fasterProjectilePrice.innerHTML = "$" + projectilePrice
        purchaseFasterButton.innerHTML = "Upgrade"
        purchaseFasterButton.style.backgroundColor = "blue" 
        purchaseFasterButton.disabled = false
    }
    
    if (shotgunUpgraded != 2) {
        if (purchaseSpreadButton.disabled == true) {
            shotgunSpreadPrice.innerHTML = "$" + shotgunPrice
            purchaseSpreadButton.innerHTML = "Upgrade"
            purchaseSpreadButton.style.backgroundColor = "blue" 
            purchaseSpreadButton.disabled = false
        }
    }    
    enemyCount = 0
    enemyCountLimit += 5
    animate()
    spawnEnemies()
})