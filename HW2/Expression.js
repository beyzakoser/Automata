"use strict";
var deger = ' '
var sayac = -1;
var tok     //current Token
var tokens  //Token.list()
var tekParametreAlan,F,ciftParametreAlan;
function match(k) {
  if (tok.kind == k) 
    tok = tokens.pop();
  else expected(k);
}
function expected(s) {
  error(s+" expected -- "+tok+" found");
}
function error(s) {
  throw ("At index "+tok.index+": "+s);
}
function showError(elt) {
  elt.selectionStart = tok.index
  elt.selectionEnd = tok.index + tok.length
  elt.focus(); 
}

class Constant {
 constructor(num) { this.num = num; }
 fValue() { return this.num; }
 toTree(val) { return deger.repeat(val) + this.num + '\n'; }
 toPostfix() { return this.num + ' '; }
 toString() { return this.num.toString(); }
}
class Binary { //iki parametre alan fonk lar için
 constructor(left, oper, right) {
  this.left = left; this.oper = oper; this.right = right;
}

fValue() {
  switch (this.oper) {
    case PLUS:  return this.left.fValue()+this.right.fValue();
    case MINUS: return this.left.fValue()-this.right.fValue();
    case STAR:  return this.left.fValue()*this.right.fValue();
    case POWER: return this.left.fValue()**this.right.fValue();
    case MOD: return this.left.fValue()%this.right.fValue();

    case SLASH: 
    let v = this.right.fValue();
    if (v == 0) 
      throw ("Division by zero");
    return this.left.fValue()/v;
    default: return NaN;

  }
}
toTree() {
  return deger.repeat(++sayac)+this.oper+'\n'+this.left.toTree(sayac)+this.right.toTree(sayac--);
}
toPostfix() {
  return this.left.toPostfix()+this.right.toPostfix()+this.oper+' '
}
toString() {
  return '('+this.left + this.oper + this.right+')'
}
}
class ikiParametre { // bu kısım iki parametre alan Math fonksiyonları için
 constructor(left, oper, right) {
  this.left = left; this.oper = oper; this.right = right;
}

fValue() {
 return Math[this.oper](this.left.fValue(),this.right.fValue());
}
toTree() {
  return deger.repeat(++sayac)+this.oper+'\n'+this.left.toTree(sayac)+this.right.toTree(sayac--);
}
toPostfix() {
  return this.left.toPostfix()+this.right.toPostfix()+this.oper+' '
}
toString() {
  return '('+this.left + this.oper + this.right+')'
}
}

class Unary { // bu kısım tek parametre alan Math fonksiyonları için
 constructor(oper, right) {
  this.oper = oper; this.right = right;
}
fValue() {

 return Math[this.oper](this.right.fValue());


}
toTree() {
  return deger.repeat(++sayac)+this.oper+'\n'+this.right.toTree(sayac--);
}
toPostfix() {
  return this.right.toPostfix()+this.oper+' '
}
toString() {
  return  this.oper +'('+ this.right+')'
}
}

function binary(e) {
  let op = tok.kind; match(op);
  return new Binary(e, op, term());
}
function expression() {
  let e = (tok.kind == MINUS)?
  binary(new Constant(0)) : term();
  while (tok.kind == PLUS || tok.kind == MINUS) 
    e = binary(e);
  return e;
}
function term() {
  let e = factor();
  while ( tok.kind == STAR || tok.kind == SLASH || tok.kind == POWER || tok.kind == MOD ) { //MOD eklendi
    let op = tok.kind; match(op);
    e = new Binary(e, op, factor());
  }
  return e;
}
function factor() {
  switch (tok.kind)  {
    case NUMBER:
    let c = tok.val;
    match(NUMBER);
    return new Constant(c);
    case LEFT:
    match(LEFT); 
    let e = expression();
    match(RIGHT); 
    return e;

    case IDENT:

    F = Object.getOwnPropertyNames(Math)
    tekParametreAlan= F.filter(k => Math[k].length==1) ; //tek parametre alanlar
    ciftParametreAlan= F.filter(k => Math[k].length==2) ; //iki parametre alanlar

    let k = tok.val; 
 if(tekParametreAlan.includes(k)){//tek parametre alanlardansa
   match(IDENT);   
   match(LEFT);
   let f=expression();
   let g=new Unary( k, f);
   match(RIGHT);

   return g;
 }
 else if(ciftParametreAlan.includes(k)){ //iki parametreli ise
  match(IDENT);   
  match(LEFT);
  let sol=expression();
  match(COMMA);
  let sag=expression();
  let g=new ikiParametre(sol, k, sag);
  match(RIGHT);

  return g;
}

default: expected("Factor");
}
return null;


}