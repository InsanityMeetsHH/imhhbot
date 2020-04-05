'use strict';

/* 
 * Source: http://jsfiddle.net/hcxabsgh/ 
 * Modified by InsanityMeetsHH
 */
(function() {
    // globals
    var canvas;
    var ctx;
    var W;
    var H;
    var mp = 150; //max particles
    var particles = [];
    var angle = 0;
    var tiltAngle = 0;
    var confettiActive = true;
    var animationComplete = true;
    var deactivationTimerHandler;
    var reactivationTimerHandler;
    var animationHandler;
    
    // objects
    var particleColors = {
        colorOptions: [
            'DodgerBlue', 'purple', 'Gold', 'pink', 'SlateBlue', 'lightblue', 
            'Violet', 'SteelBlue', 'SandyBrown', 'Chocolate', 'Crimson'
        ],
        colorIndex: 0,
        colorIncrementer: 0,
        colorThreshold: 10,
        getColor: function() {
            if (this.colorIncrementer >= 10) {
                this.colorIncrementer = 0;
                this.colorIndex++;
                
                if (this.colorIndex >= this.colorOptions.length) {
                    this.colorIndex = 0;
                }
            }
            this.colorIncrementer++;
            return this.colorOptions[this.colorIndex];
        }
    };
    
    function confettiRandomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }
    
    function ConfettiParticle(color) {
        this.x = Math.random() * W; // x-coordinate
        this.y = (Math.random() * H) - H; //y-coordinate
        this.r = confettiRandomFromTo(10, 30); //radius;
        this.d = (Math.random() * mp) + 10; //density;
        this.color = color;
        this.tilt = Math.floor(Math.random() * 10) - 10;
        this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
        this.tiltAngle = 0;

        this.draw = function() {
            ctx.beginPath();
            ctx.lineWidth = this.r / 2;
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
            ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
            return ctx.stroke();
        };
    }
    
    function confettiSetGlobals() {
        canvas = document.getElementById('confetti');
        ctx = canvas.getContext('2d');
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    
    function confettiStepParticle(particle, particleIndex) {
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 2;
        particle.x += Math.sin(angle);
        particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
    }
    
    function confettiRepositionParticle(particle, xCoordinate, yCoordinate, tilt) {
        particle.x = xCoordinate;
        particle.y = yCoordinate;
        particle.tilt = tilt;
    }

    function confettiCheckForReposition(particle, index) {
        if ((particle.x > W + 20 || particle.x < -20 || particle.y > H) && confettiActive) {
            if (index % 5 > 0 || index % 2 === 0) { //66.67% of the flakes
                confettiRepositionParticle(particle, Math.random() * W, -10, Math.floor(Math.random() * 10) - 20);
            } else {
                if (Math.sin(angle) > 0) {
                    //Enter from the left
                    confettiRepositionParticle(particle, -20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
                } else {
                    //Enter from the right
                    confettiRepositionParticle(particle, W + 20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
                }
            }
        }
    }
    
    function confettiStop() {
        animationComplete = true;
        if (typeof ctx === 'undefined') {
            return;
        }
        
        ctx.clearRect(0, 0, W, H);
    }
    
    function confettiUpdate() {
        var remainingFlakes = 0;
        var particle;
        angle += 0.01;
        tiltAngle += 0.1;

        for (var i = 0; i < mp; i++) {
            particle = particles[i];
            if (animationComplete) {
                return;
            }

            if (!confettiActive && particle.y < -15) {
                particle.y = H + 100;
                continue;
            }
            
            confettiStepParticle(particle, i);
            
            if (particle.y <= H) {
                remainingFlakes++;
            }
            
            confettiCheckForReposition(particle, i);
        }

        if (remainingFlakes === 0) {
            confettiStop();
        }
    }
    
    function confettiDraw() {
        ctx.clearRect(0, 0, W, H);
        var results = [];
        for (var i = 0; i < mp; i++) {
            (function(j) {
                results.push(particles[j].draw());
            })(i);
        }
        confettiUpdate();

        return results;
    }
    
    function startConfetti() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        (function animloop() {
            if (animationComplete) {
                return null;
            }
            
            animationHandler = window.requestAnimFrame(animloop);
            return confettiDraw();
        })();
    }
    
    function initializeConfetti() {
        particles = [];
        animationComplete = false;
        for (var i = 0; i < mp; i++) {
            var particleColor = particleColors.getColor();
            particles.push(new ConfettiParticle(particleColor));
        }
        startConfetti();
    }
    
    function confettiClearTimers() {
        clearTimeout(reactivationTimerHandler);
        clearTimeout(animationHandler);
    }
    
    function confettiDeactivate() {
        confettiActive = false;
        confettiClearTimers();
    }
    
    function restartConfetti() {
        confettiClearTimers();
        confettiStop();
        reactivationTimerHandler = setTimeout(function() {
            confettiActive = true;
            animationComplete = false;
            initializeConfetti();
        }, 100);
    }

    function initializeConfettiButton() {
        jQuery('#setupButton').click(confettiSetup);
        jQuery('#startButton').click(restartConfetti);
        jQuery('#stopButton').click(confettiDeactivate);
    }
    
    function confettiSetup() {
        confettiSetGlobals();
        initializeConfetti();
        
        jQuery(window).resize(function() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
        });
    }
    
    jQuery(window).ready(function() {
        setTimeout(function() {
            initializeConfettiButton();
            jQuery('#setupButton').click();
        }, 1500);
    });
    
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame || 
        function(callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
})();
