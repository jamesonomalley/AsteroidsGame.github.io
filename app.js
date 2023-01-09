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
const purchaseSpreadButton = document.querySelector('#purchaseSpreadButton')
const purchaseDamageButton = document.querySelector('#purchaseDamageButton')
const purchaseMoneyButton = document.querySelector('#purchaseMoneyButton')
const doneButton = document.querySelector('#doneButton')
const fasterProjectilePrice = document.querySelector('#fasterProjectilePrice')
const shotgunSpreadPrice = document.querySelector('#shotgunSpreadPrice')
const higherDamagePrice = document.querySelector('#higherDamagePrice')
const moreMoneyPrice = document.querySelector('#moreMoneyPrice')

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
    enemyCount = 0
    enemyCountLimit = 10
    enemySpeed = 1
    paused = false
    pausedLevelUp = false
    projectileSpeed = 3
    shotgunBought = false
    shotgunUpgraded = 0
    projectilePrice = 300
    shotgunPrice = 1000
    damagePrice = 1200
    damageBought = false
    damageUpgraded = 0
    moneyPrice = 200
    lowDamageMoneyGained = 12
    killDamageMoneyGained = 37
    levelUp = 0
    enemyRespawnTime = 1105.2
    enemyLevelUpRespawnTime = 1703.3
    scoreElement.innerHTML = score
    modalScoreElement.innerHTML = score
    moneyElement.innerHTML = money
    fasterProjectilePrice.innerHTML = "$" + projectilePrice
    shotgunSpreadPrice.innerHTML = "$" + shotgunPrice
    higherDamagePrice.innerHTML = "$" + damagePrice
    moreMoneyPrice.innerHTML = "$" + moneyPrice
    clearEnemies()
    context.clearRect(0, 0, canvas.width, canvas.height);
}

var levelUp = 0
var enemyCount = 0
var enemyCountLimit = 10
var enemySpeed = 1
var paused = false
var pausedLevelUp = false
var enemyRespawnTime = 1105.2
var enemyLevelUpRespawnTime = 1703.3
var spawner
var spawnerLevelUp
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
            let velocity = {x: Math.cos(angle), y: Math.sin(angle)}
            if (enemyCount != enemyCountLimit) {
                enemies.push(new Enemy(x, y, radius, color, velocity)) 
                enemyCount++             
            }
            else {
                clearEnemies() 
                paused = true       
            }                
    }, enemyRespawnTime)   
    if (levelUp > 1) {
        spawnerLevelUp = setInterval(() => {
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
            let velocity = {x: Math.cos(angle) * enemySpeed, y: Math.sin(angle) * enemySpeed}
            if (enemyCount != enemyCountLimit) {
                enemies.push(new Enemy(x, y, radius, color, velocity)) 
                enemyCount++             
            }
            else {
                clearEnemies() 
                pausedLevelUp = true       
            }                
        }, enemyLevelUpRespawnTime)
    } 
}

function clearEnemies() {
    clearInterval(spawner)
    clearInterval(spawnerLevelUp)
}

let animationId
let score = 0
let money = 0
var lowDamageMoneyGained = 12
var killDamageMoneyGained = 37
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
                if (damageBought){          
                    console.log("Entering damage bought true")       
                    if (damageUpgraded == 2) {
                        console.log("Entering damange upgraded 2")
                        if (enemy.radius - 20 > 5) {
                            // increase score
                            score += 100
                            money += lowDamageMoneyGained
                            scoreElement.innerHTML = score
                            moneyElement.innerHTML = money
                            gsap.to(enemy, {
                                radius: enemy.radius - 20
                            })
                            projectiles.splice(projectileIndex, 1)
                        }
                        else {
                            // remove from canvas altogether
                            // increase score
                            score += 250
                            money += killDamageMoneyGained
                            scoreElement.innerHTML = score
                            moneyElement.innerHTML = money
                            enemies.splice(enemyIndex, 1)
                            projectiles.splice(projectileIndex, 1)
                            if (enemies.length == 0 && (paused == true || pausedLevelUp == true)) { 
                                setTimeout(() => {
                                    cancelAnimationFrame(animationId)                       
                                    pauseModalElement.style.display = 'flex' 
                                }, 1500)                        
                            } 
                        }
                    }
                    else {
                        if (enemy.radius - 15 > 5) {
                            // increase score
                            score += 100
                            money += lowDamageMoneyGained
                            scoreElement.innerHTML = score
                            moneyElement.innerHTML = money
                            gsap.to(enemy, {
                                radius: enemy.radius - 15
                            })
                            projectiles.splice(projectileIndex, 1)
                        }
                        else {
                            // remove from canvas altogether
                            // increase score
                            score += 250
                            money += killDamageMoneyGained
                            scoreElement.innerHTML = score
                            moneyElement.innerHTML = money
                            enemies.splice(enemyIndex, 1)
                            projectiles.splice(projectileIndex, 1)
                            if (enemies.length == 0 && (paused == true || pausedLevelUp == true)) { 
                                setTimeout(() => {
                                    cancelAnimationFrame(animationId)                       
                                    pauseModalElement.style.display = 'flex' 
                                }, 1500)                        
                            } 
                        }
                    }
                }
                else {
                    console.log("Entering normal damage")
                    if (enemy.radius - 10 > 5) {
                        // increase score
                        score += 100
                        money += lowDamageMoneyGained
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
                        money += killDamageMoneyGained
                        scoreElement.innerHTML = score
                        moneyElement.innerHTML = money
                        enemies.splice(enemyIndex, 1)
                        projectiles.splice(projectileIndex, 1)
                        if (enemies.length == 0 && (paused == true || pausedLevelUp == true)) { 
                            setTimeout(() => {
                                cancelAnimationFrame(animationId)                       
                                pauseModalElement.style.display = 'flex' 
                            }, 1500)                        
                        } 
                    }
                }
                
            }
        })

        // end game
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
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
    })
}

var projectileSpeed = 3
var shotgunBought = false
var shotgunUpgraded = 0
var damageBought = false
var damageUpgraded = 0
var projectilePrice = 300
var moneyPrice = 200
var shotgunPrice = 1000
var damagePrice = 1200
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
            const angle4 = Math.atan2(event.clientY - canvas.height / 1.7, event.clientX - canvas.width / 2)
            const velocity4 = {x: Math.cos(angle4) * projectileSpeed, y: Math.sin(angle4) * projectileSpeed}
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity4)
            ) 
            const angle5 = Math.atan2(event.clientY - canvas.height / 2.3, event.clientX - canvas.width / 2)
            const velocity5 = {x: Math.cos(angle5) * projectileSpeed, y: Math.sin(angle5) * projectileSpeed}
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity5)
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
        projectileSpeed += 0.75
        purchaseFasterButton.innerHTML = "Purchased!"
        purchaseFasterButton.style.backgroundColor = "green" 
        purchaseFasterButton.disabled = true
        projectilePrice *= 2.5
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

purchaseDamageButton.addEventListener('click', () => {
    if (money > damagePrice) {
        higherDamagePrice.innerHTML = "$" + damagePrice
        money -= damagePrice
        moneyElement.innerHTML = money
        damageBought = true
        damageUpgraded++
        damagePrice *= 8
        purchaseDamageButton.innerHTML = "Purchased!"
        purchaseDamageButton.style.backgroundColor = "green" 
        purchaseDamageButton.disabled = true
    }
    else {
        purchaseDamageButton.innerHTML = "Insufficient Funds!"
        purchaseDamageButton.style.backgroundColor = "red" 
        purchaseDamageButton.disabled = true
    }
})

purchaseMoneyButton.addEventListener('click', () => {
    if (money > moneyPrice) {
        moreMoneyPrice.innerHTML = "$" + moneyPrice
        money -= moneyPrice
        moneyElement.innerHTML = money
        lowDamageMoneyGained = Math.trunc(lowDamageMoneyGained * 1.15)
        killDamageMoneyGained = Math.trunc(killDamageMoneyGained * 1.15)
        moneyPrice += 250
        purchaseMoneyButton.innerHTML = "Purchased!"
        purchaseMoneyButton.style.backgroundColor = "green" 
        purchaseMoneyButton.disabled = true
    }
    else {
        purchaseMoneyButton.innerHTML = "Insufficient Funds!"
        purchaseMoneyButton.style.backgroundColor = "red" 
        purchaseMoneyButton.disabled = true
    }
})

doneButton.addEventListener('click', () => {
    levelUp++
    pauseModalElement.style.display = 'none'
    paused = false
    pausedLevelUp = false
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
    else if (shotgunUpgraded == 2) {
        shotgunSpreadPrice.innerHTML = "-"
        purchaseSpreadButton.innerHTML = "Max"
        purchaseSpreadButton.style.backgroundColor = "gray"
    } 

    if (damageUpgraded != 2) {
        if (purchaseDamageButton.disabled == true) {
            higherDamagePrice.innerHTML = "$" + damagePrice
            purchaseDamageButton.innerHTML = "Upgrade"
            purchaseDamageButton.style.backgroundColor = "blue" 
            purchaseDamageButton.disabled = false
        }
    }
    else if (damageUpgraded == 2) {
        higherDamagePrice.innerHTML = "-"
        purchaseDamageButton.innerHTML = "Max"
        purchaseDamageButton.style.backgroundColor = "gray"
    }

    if (purchaseMoneyButton.disabled == true) {
        moreMoneyPrice.innerHTML = "$" + moneyPrice
        purchaseMoneyButton.innerHTML = "Upgrade"
        purchaseMoneyButton.style.backgroundColor = "blue" 
        purchaseMoneyButton.disabled = false
    }
     
    enemyCount = 0    
    enemyCountLimit += 5   
    animate()
    spawnEnemies()

    if (levelUp > 2) {
        if (enemyLevelUpRespawnTime > 400) {
            enemyLevelUpRespawnTime -= 50
        }        
        enemySpeed += 0.2
    } 
})