export class ItemTemplate{
    constructor(templateObj){
        this.id = "NewItem";
        this.name = "Generic Item";
        this.iconfile = "assets/img/qmark-tiny.png";
        this.wtype = "ITEM";
        this.maxUses = 40;
        this.goldValue = 200;
        //weapon-specific stats:
        this.rank = "E";
        this.might = 0;
        this.hit = 80;
        this.crit = 0;
        this.weight = 8;
        this.range = [1];
        //weapon type flags
        this.brave = false;
        this.magic = false;
        if(templateObj){
            this.id = templateObj.id ? templateObj.id : this.id;
            this.name = templateObj.name ? templateObj.name : this.name;
            this.iconfile = templateObj.iconfile ? templateObj.iconfile : this.iconfile;
            this.wtype = templateObj.wtype ? templateObj.wtype : this.wtype;
            this.maxUses = templateObj.maxUses ? templateObj.maxUses : this.maxUses;
            this.goldValue = templateObj.goldValue ? templateObj.goldValue : this.goldValue;
            this.rank = templateObj.rank ? templateObj.rank : this.rank;
            this.might = templateObj.might ? templateObj.might : this.might;
            this.hit = templateObj.hit ? templateObj.hit : this.hit;
            this.crit = templateObj.crit ? templateObj.crit : this.crit;
            this.weight = templateObj.weight ? templateObj.weight : this.weight;
            this.range = templateObj.range ? templateObj.range : this.range;
            this.brave = templateObj.brave ? templateObj.brave : this.brave;
            this.magic = templateObj.magic ? templateObj.magic : this.magic;
        }
    }
    minRange(){
        return Math.min(...this.range);
    }
    maxRange(){
        return Math.max(...this.range);
    }
    getCopy(){
        return new ItemTemplate(this);
    }
}