let devBonus = false;

function SecondCap(){


    let base = devBonus ? new Decimal(0.1) : new Decimal(10)
    base = base.div(tmp["q"].effect)

    return base
}

function getPointGen() 
{


    if(!canGenPoints())
		return new Decimal(0)

    let gain = new Decimal(1)
    gain = gain.times(tmp["p"].buyables["11"].effect)
    gain = gain.times(new Decimal(10)).div(SecondCap())
    if(hasUpgrade("b", 12)) gain = gain.times(upgradeEffect("b",12))



    gain = gain.round()
    if (player.points.gt(gain.mul(SecondCap()))){
        player.points = gain.mul(SecondCap())
        gain = new Decimal(0)
    }

    if (player.points.gte(gain.mul(SecondCap()))){
        gain = new Decimal(0)
    }

    return gain
}

function getCostMult(){
    let ret = new Decimal(3) 
    ret = ret.add(tmp["b"].effect)

    return ret;
}

function getEffectMult(){
    let ret = new Decimal(2) 
    ret = ret.add(tmp["b"].effect)

    return ret
}


addLayer("p", {
    tabFormat: [
    "main-display",
    function(){
        if(!hasMilestone("q",0)){
            return ["prestige-button", function(){}]
        }
        else return ""
    },
    "blank",
    "buyables",
    
],

    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#9e30cf",

    resetsNothing(){return hasMilestone("b", 0)},
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    componentStyles:{
        "buyable"(){return {'height':'300px', 'width' : '300px', 'font-size': '15px'}}
    },
    
    getResetGain(){
        return this.baseAmount().sub(player.p.points).floor().max(0)
    },
    canReset(){
        //if(player.p.points.gt(getPointGen().mul(new Decimal(10)))) return false
        if(player.p.points.gte(this.baseAmount().floor())) return false
        return true
    },
    prestigeButtonText(){
        if (player.tab != "p") return ""
        let a;
        a = "Reset for "+ formatWhole(tmp["p"].resetGain) + " prestige points"
        return a
    },
    buyables: {
        rows: 1,
        cols: 1,
        11:{
            cost(){return getCostMult().pow(getBuyableAmount(this.layer, this.id))},
            effect(){return getEffectMult().pow(getBuyableAmount(this.layer, this.id))},
            title: "Boost",
            display() {
                if(!shiftDown){
                let eff = "<b><h2>Effect</h2>: x" + formatWhole(this.effect()) + " points</b><br>"
                
                let amt = "<b><h2>Amount</h2>: " + getBuyableAmount(this.layer, this.id) + "</b><br>"
                
                let cost = "<b><h2>Cost</h2>: " + formatWhole(this.cost()) + " prestige points</b><br>"

                let shf = "Press shift for more details<br>"

                return "<br><br>"+ amt + cost+ eff+shf+"<br>"
                }
                let cost = "<b><h2>Cost Formula</h2>: " + format(getCostMult(),2)+ "^x</b><br>"
                let eff = "<b><h2>Effect Formula</h2>: " + format(getEffectMult(),2)+ "^x</b><br>"

                return "<br><br>"+ cost+ eff
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy(){
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        }
    },


    getPP(){
        if(hasMilestone("q", 0)){
            player.p.points = player.p.points.max(player.points)
        }
    
        return false
    },


    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})
addLayer("b", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    branches:["p"],
    color: "#1ce34a",                       // The color for this layer, which affects many elements.
    resource: "boosters",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
    effect(){
        return player.b.points.pow(0.65).mul(0.6)
        return player.b.points.mul(0.5).sub(player.b.points.pow(11/21).sub(new Decimal(1.65)).max(new Decimal(0)))
    },
    effectDescription(){
        let mult = hasUpgrade("b", 12) ? " and boosting point generation by " + format(upgradeEffect("b",12),2) : ""

        return "which is increasing the buyable cost and effect base by " + format(tmp["b"].effect) + mult +"."

    },

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(500),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    base(){return hasUpgrade("b", 11) ? 9 : 10},                          // "normal" prestige gain is (currency^exponent).
    exponent: 1,

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    milestones:{
        0:{
            requirementDescription: "3 Boosters",
            effectDescription: "Prestige Points doesn't reset points",
            done(){return player.b.points.gte(new Decimal(3))},
        },

    },    
    upgrades:{
        rows:1,
        cols:3,
        11:{
            description: "Lower booster cost scaling",
            cost: new Decimal(3),
            unlocked(){return hasMilestone("b", 0)},
        },

        12:{
            description: "Unlock a booster effect",
            cost: new Decimal(4),
            unlocked(){return hasUpgrade("b", 11)},
            effect(){
                
                    if(player.b.points.gte(4)){
                        return new Decimal(1.3).pow(player.b.points.sub(new Decimal(3)).log(new Decimal(2)).add(new Decimal(1)).log(new Decimal(2)).add(new Decimal(1)).log(new Decimal(2)).add(new Decimal(1)))
                    }
                    return new Decimal(1)
                    
                }
        },

        13:{
            description:"Unlock a new Layer",
            cost: new Decimal(6),
            unlocked(){return hasUpgrade("b", 12)&&player.b.best.gte(new Decimal(9))},
        }


    },
    hotkeys: [
        {key: "b", description: "B: Reset for boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        if(player.b.unlocked) return true 
        if(getBuyableAmount("p",11).gte(5)) return true
        return false
    }
                                 // Returns a bool for if this layer's node should be visible in the tree.
})
addLayer("q",{
    startData(){ return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    symbol: "Q",
    row: 1,
    resource: "quickeners", // Name of prestige currency
    baseResource: "boosters",
    branches:["b"],
    color: "#29d69f",
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "static",
    base: 3,
    exponent: 2,
    requires: 3,
    effect(){
        return new Decimal(2).pow(player.q.points)
    },

    effectDescription(){
        return "which is multiplying point gain and dividing point cap by " + formatWhole(tmp["q"].effect) + "."
    },


    layerShown(){
        if(hasUpgrade("b", 13)) return true
        return false

    },

    milestones:{
        0:{
            requirementDescription: "1 Quickener",
            effectDescription: "Automatically get Prestige Points",
            done(){return player.q.points.gte(new Decimal(1))},
        },

    },   

})