/* Ability data for the interactive timeline.
   Times are in seconds after the ability is confirmed/activated.
   Negative times are the "until Confirm" phase, drawn at a fixed width.
   Row "m" lists the module keys that drive the row: A: action, D: data, C: control, B: base class settings.
   Transcribed from the editor timelines; edit freely as the framework changes. */

const MODULE_INFO = {
  "A:Instant Effect": "Applies the Effect data module's gameplay effects to the resolved targets at the moment it runs.",
  "A:Projectile": "Spawns a projectile that carries the ability's effects to whatever it hits.",
  "A:Multi Actor": "Spawns several actors (meteors, wall segments) in a pattern around the target point.",
  "A:Actor": "Spawns one actor for as long as the ability is active, and takes it back when it ends.",
  "A:Aura": "Keeps an overlap volume around the caster: applies effects on enter and removes them on leave.",
  "D:Effect": "Effect groups with team-relation target filters (for example enemies only) and stack counts.",
  "D:Radius": "Area radius. Default value or a curve table per ability level; other modules can bind to it.",
  "D:Range": "Maximum range, with a range policy (for example clamp from pawn).",
  "D:Duration": "Duration value, used here by the movement module for the leap time.",
  "D:Height": "Height value, used here for the leap arc.",
  "C:Input": "Input windows: which tags confirm or cancel, on press or release, and how often.",
  "C:Targeting": "Where the ability aims (screen centre, cursor, lock-on) and how the caster faces the aim.",
  "C:Target Resolver": "Finds the targets, here with a sphere whose radius is bound to the Radius module.",
  "C:Precast": "Aim preview before confirming: ground area decal and target highlight.",
  "C:Cast": "Cast time before the action runs. Can be interrupted.",
  "C:Movement": "Moves the caster or target, here a leap to the aim point along an editable arc.",
  "C:Animation": "Montages chosen by tag, each with its own start and stop events, play rate and root-motion scale.",
  "C:VFX": "Niagara systems with start and stop events, placement, socket and offsets.",
  "C:Spawned Actor Resolver": "Decides where spawned actors go and what they aim at.",
  "C:Tags While": "Grants gameplay tags for a window of the ability, such as Casting.",
  "C:Effects While": "Applies gameplay effects for a window of the ability, such as a slow while blocking.",
  "B:Settings": "Base class settings: activation groups, cost commit timing, cooldown and interruption."
};

const ABILITIES = [
{
  id:"leap", name:"Blazing Leap", base:"Confirmed", preLabel:"until Confirm", end:0.86, span:1.6,
  phases:[[0,"Confirmed"],[0.8,"Arrived / Acted"]],
  modules:{action:"Instant Effect", data:["Effect","Radius","Range","Duration","Height"],
           control:["Input","Targeting","Target Resolver","Precast","Movement","Animation","VFX"]},
  rows:[
    {l:"Input", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Confirm"}]},
    {l:"", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Confirm 2"}]},
    {l:"", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Cancel"}]},
    {l:"Precast", m:["C:Precast","D:Range"], c:"precast", items:[{a:-1,b:0,t:"Aim preview"}]},
    {l:"Face Aim", m:["C:Targeting"], c:"move", items:[{p:0,t:"Turns to the aim"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:0.8,t:"JumpStart"},{a:0.8,b:1.35,t:"JumpLand",fade:1}]},
    {l:"VFX", m:["C:VFX"], c:"vfx", items:[{p:0.8,t:"FireNova"}]},
    {l:"Action", m:["A:Instant Effect","D:Effect","D:Radius","C:Target Resolver"], c:"action", items:[{p:0.8,t:"Instant Effect"}]},
    {l:"Movement", m:["C:Movement","D:Duration","D:Height","D:Range"], c:"move", items:[{a:0,b:0.8,t:"Leap"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:-1,b:0,t:"Exclusive Replaceable"},{a:0,b:0.86,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{a:-1,b:0,t:"Watched"}]},
    {l:"", m:["B:Settings"], c:"cost", items:[{p:-1,t:"Cost checked"},{p:0,t:"Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:0.86,b:99,t:"Cooldown 10.0 s"}]}
  ]
},
{
  id:"fireball", name:"Fireball", base:"Instant", end:0.75, span:1.25,
  phases:[[0,"Activated / Cast Started"],[0.5,"Cast Completed / Acted"]],
  modules:{action:"Projectile", data:["Effect","Range","Radius"],
           control:["Targeting","Animation","Cast","Spawned Actor Resolver","Tags While"]},
  rows:[
    {l:"Cast", m:["C:Cast"], c:"cast", items:[{a:0,b:0.5,t:"Cast 0.50 s"}]},
    {l:"Face Aim", m:["C:Targeting"], c:"move", items:[{a:0,b:0.5,t:"Follows the aim"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:0.5,t:"SpellCast"},{a:0.5,b:1.0,t:"SpellRelease",fade:1}]},
    {l:"Action", m:["A:Projectile","D:Effect","D:Range","D:Radius","C:Spawned Actor Resolver"], c:"action", items:[{p:0.5,t:"Projectile"}]},
    {l:"Tags While", m:["C:Tags While"], c:"tags", items:[{a:0,b:0.5,t:"ASC.State.Casting.CanMove"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:0,b:0.75,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:0,t:"Cost checked"},{p:0.5,t:"Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:0.5,b:99,t:"Cooldown 1.0 s"}]}
  ]
},
{
  id:"meteor", name:"Meteor Shower", base:"Confirmed", preLabel:"until Confirm", end:2.4, span:2.9,
  phases:[[0,"Confirmed / Cast Started"],[1,"Cast Completed / Acted"]],
  modules:{action:"Multi Actor", data:["Effect","Radius","Range"],
           control:["Targeting","Target Resolver","Precast","Cast","Animation","VFX","Spawned Actor Resolver","Input","Tags While"]},
  rows:[
    {l:"Input", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Confirm"}]},
    {l:"", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Cancel"}]},
    {l:"", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Own Key Cancels"}]},
    {l:"Precast", m:["C:Precast","D:Range","D:Radius"], c:"precast", items:[{a:-1,b:0,t:"Aim preview"}]},
    {l:"Face Aim", m:["C:Targeting"], c:"move", items:[{p:0,t:"Turns to the aim"}]},
    {l:"Cast", m:["C:Cast"], c:"cast", items:[{a:0,b:1,t:"Cast 1.00 s"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:1,t:"SpellCast"},{a:1,b:2.4,t:"SpellRelease"}]},
    {l:"VFX", m:["C:VFX"], c:"vfx", items:[{a:0,b:1,t:"Cast VFX"}]},
    {l:"Action", m:["A:Multi Actor","D:Effect","D:Radius","C:Target Resolver","C:Spawned Actor Resolver"], c:"action", items:[{a:1,b:2.4,t:"Multi Actor"}]},
    {l:"Tags While", m:["C:Tags While"], c:"tags", items:[{a:0,b:1,t:"ASC.State.Casting"}]},
    {l:"Interrupted By", m:["B:Settings"], c:"int", items:[{a:0,b:1,t:"ASC.State.Moving"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:-1,b:0,t:"Exclusive Replaceable"},{a:0,b:2.4,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{a:-1,b:1,t:"Watched"}]},
    {l:"", m:["B:Settings"], c:"cost", items:[{p:-1,t:"Cost checked"},{p:1,t:"Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:1,b:99,t:"Cooldown 8.0 s"}]}
  ]
},
{
  id:"icewall", name:"Ice Wall", base:"Confirmed", preLabel:"until Confirm", end:0.36, span:0.75,
  phases:[[0,"Confirmed / Acted"]],
  modules:{action:"Multi Actor", data:["Radius","Range","Duration"], control:["Targeting","Precast","Animation","Input"]},
  rows:[
    {l:"Input", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Confirm"}]},
    {l:"", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Cancel"}]},
    {l:"Precast", m:["C:Precast","D:Range"], c:"precast", items:[{a:-1,b:0,t:"Aim preview"}]},
    {l:"Face Aim", m:["C:Targeting"], c:"move", items:[{p:0,t:"Turns to the aim"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:0.36,t:"SpellRelease"}]},
    {l:"Action", m:["A:Multi Actor","D:Radius","D:Duration"], c:"action", items:[{a:0,b:0.36,t:"Multi Actor"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:-1,b:0,t:"Exclusive Replaceable"},{a:0,b:0.36,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:-1,t:"Cost checked"},{p:0,t:"Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:0,b:99,t:"Cooldown 6.0 s"}]}
  ]
},
{
  id:"shield", name:"Hold Shield", base:"Modular", preLabel:"until Release", end:0, span:0.5,
  phases:[[0,"Release"]], preStart:"Activated / Acted",
  modules:{action:"Actor", data:["Effect"], control:["Input","Animation","Effects While"]},
  rows:[
    {l:"Input", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Release"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:-1,b:0,t:"ShieldBlock"},{a:0,b:0.25,t:"",fade:1}]},
    {l:"Action", m:["A:Actor"], c:"action", items:[{p:-1,t:"Actor"},{p:0,t:"Taken back"}]},
    {l:"Effects While", m:["C:Effects While","D:Effect"], c:"eff", items:[{a:-1,b:0,t:"Slow"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:-1,b:0,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:-1,t:"Cost checked, Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:0,b:99,t:"Cooldown 0.5 s"}]}
  ]
},
{
  id:"channel", name:"Channelled Pulse", base:"Channelling", end:3, span:3.3,
  phases:[[0,"Activated / Started"],[3,"Completed"]],
  modules:{action:"Instant Effect", data:["Effect","Radius"], control:["Target Resolver","VFX","Animation"]},
  rows:[
    {l:"Channel", m:["B:Settings"], c:"chan", items:[{a:0,b:3,t:"Channel 3.00 s, tick every 0.75 s"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:3,t:"SpellChannel"}]},
    {l:"VFX", m:["C:VFX"], c:"vfx", items:[{p:0,t:""},{p:0.75,t:""},{p:1.5,t:""},{p:2.25,t:""},{p:3,t:""}]},
    {l:"Action", m:["A:Instant Effect","D:Effect","D:Radius","C:Target Resolver"], c:"action", items:[{p:0,t:""},{p:0.75,t:""},{p:1.5,t:""},{p:2.25,t:""},{p:3,t:""}]},
    {l:"Interrupted By", m:["B:Settings"], c:"int", items:[{a:0,b:3,t:"ASC.State.Moving"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:0,b:3,t:"Exclusive Replaceable"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:0,t:"Cost checked, Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:3,b:99,t:"Cooldown 3.0 s"}]}
  ]
},
{
  id:"heal", name:"Ground Heal", base:"Confirmed", preLabel:"until Confirm", end:1, span:1.6,
  phases:[[0,"Confirmed / Cast Started"],[1,"Cast Completed / Acted"]],
  modules:{action:"Instant Effect", data:["Effect","Radius","Range"],
           control:["Targeting","Target Resolver","Precast","Cast","VFX","Animation","Input","Tags While"]},
  rows:[
    {l:"Input", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Confirm"}]},
    {l:"", m:["C:Input"], c:"input", items:[{a:-1,b:0,t:"Cancel"}]},
    {l:"Precast", m:["C:Precast","D:Range","D:Radius"], c:"precast", items:[{a:-1,b:0,t:"Aim preview"}]},
    {l:"Cast", m:["C:Cast"], c:"cast", items:[{a:0,b:1,t:"Cast 1.00 s"}]},
    {l:"Face Aim", m:["C:Targeting"], c:"move", items:[{a:0,b:1,t:"Follows the aim"}]},
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:1,t:"SpellCast"},{a:1,b:1.4,t:"SpellRelease",fade:1}]},
    {l:"VFX", m:["C:VFX"], c:"vfx", items:[{a:0,b:1,t:"Heal_Cast"},{p:1,t:"HealBurst"}]},
    {l:"Action", m:["A:Instant Effect","D:Effect","D:Radius","C:Target Resolver"], c:"action", items:[{p:1,t:"Instant Effect"}]},
    {l:"Tags While", m:["C:Tags While"], c:"tags", items:[{a:0,b:1,t:"ASC.State.Casting"}]},
    {l:"Interrupted By", m:["B:Settings"], c:"int", items:[{a:0,b:1,t:"ASC.State.Moving"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:-1,b:0,t:"Exclusive Replaceable"},{a:0,b:1,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:-1,t:"Cost checked"},{p:1,t:"Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:1,b:99,t:"Cooldown 3.0 s"}]}
  ]
},
{
  id:"roll", name:"Evasive Roll", base:"Instant", end:1.23, span:1.7,
  phases:[[0,"Activated / Acted"]],
  modules:{action:"Instant Effect", data:["Effect"], control:["Animation"]},
  rows:[
    {l:"Animation", m:["C:Animation"], c:"anim", items:[{a:0,b:1.23,t:"Roll (root motion)"},{a:1.23,b:1.45,t:"",fade:1}]},
    {l:"Action", m:["A:Instant Effect","D:Effect"], c:"action", items:[{p:0,t:"Instant Effect: speed buff"}]},
    {l:"Group", m:["B:Settings"], c:"group", items:[{a:0,b:1.23,t:"Exclusive Blocking"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:0,t:"Cost checked, Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:0,b:99,t:"Cooldown 3.0 s"}]}
  ]
},
{
  id:"aura", name:"Immolation Aura", base:"Channelling", end:6, span:6.5,
  phases:[[0,"Activated / Acted"],[6,"Completed"]],
  modules:{action:"Aura", data:["Effect","Radius"], control:["VFX"]},
  rows:[
    {l:"Channel", m:["B:Settings"], c:"chan", items:[{a:0,b:6,t:"Channel 6.00 s"}]},
    {l:"VFX", m:["C:VFX"], c:"vfx", items:[{a:0,b:6,t:"ImmolationAura"}]},
    {l:"Action", m:["A:Aura","D:Effect","D:Radius"], c:"action", items:[{a:0,b:6,t:"Aura: apply on enter, remove on leave"}]},
    {l:"Cost", m:["B:Settings"], c:"cost", items:[{p:0,t:"Cost checked, Cost paid"}]},
    {l:"Cooldown", m:["B:Settings"], c:"cd", items:[{a:6,b:99,t:"Cooldown 4.0 s"}]}
  ]
},
{
  id:"passive", name:"Burning Blood (passive)", base:"Passive", end:null, span:21,
  phases:[[0,"Activated / Started"],[10,"Acted"]],
  modules:{action:"Instant Effect", data:["Effect","Radius"], control:["Targeting","Target Resolver","VFX"]},
  rows:[
    {l:"Passive", m:["B:Settings"], c:"chan", items:[{a:0,b:99,t:"Passive until removed, ticks every 10 s"}]},
    {l:"VFX", m:["C:VFX"], c:"vfx", items:[{p:10,t:"FireNova"},{p:20,t:""}]},
    {l:"Action", m:["A:Instant Effect","D:Effect","D:Radius","C:Target Resolver","C:Targeting"], c:"action", items:[{p:10,t:"Instant Effect"},{p:20,t:""}]}
  ]
}
];
