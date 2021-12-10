message="127,50,255";
[r,g,b]=message.split(",");
console.log("msg:",message,"rgb:",r,g,b);

[r,g,b]=[r/255,g/255,b/255];
X=r*0.664511+g*0.154324+b*0.162028;
Y=r*0.283881+g*0.668433+b*0.047685;
Z=r*0.000088+g*0.072310+b*0.986039;

x=(X/(X+Y+Z));
y=(Y/(X+Y+Z));

x=isNaN(x)?0:x.toFixed(6);
y=isNaN(y)?0:y.toFixed(6); 

console.log('set:',r,g,b, x, y); 
console.log(JSON.stringify({"color": {"x": x, "y": y}}))
