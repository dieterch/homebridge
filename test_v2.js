function HSVtoRGB(r,a,e){
    var t,s,o,b,c,n,i,u;
    switch(1===arguments.length&&(a=r.s,e=r.v,r=r.h),n=e*(1-a),i=e*(1-(c=6*r-(b=Math.floor(6*r)))*a),u=e*(1-(1-c)*a),b%6){
        case 0:t=e,s=u,o=n;break;
        case 1:t=i,s=e,o=n;break;
        case 2:t=n,s=e,o=u;break;
        case 3:t=n,s=i,o=e;break;
        case 4:t=u,s=n,o=e;break;
        case 5:t=e,s=n,o=i}
    return{r:Math.round(255*t),g:Math.round(255*s),b:Math.round(255*o)}
}

function ScaledHSVtoRGB(r,a,e){
    return HSVtoRGB(r/360,a/100,e/100)}

function rgb_to_cie(r,a,e){
    var t=.664511*(r=r>.04045?Math.pow((r+.055)/1.055,2.4):r/12.92)+.154324*(a=a>.04045?Math.pow((a+.055)/1.055,2.4):a/12.92)+.162028*(e=e>.04045?Math.pow((e+.055)/1.055,2.4):e/12.92),s=.283881*r+.668433*a+.047685*e,o=88e-6*r+.07231*a+.986039*e,b=(t/(t+s+o)).toFixed(4),c=(s/(t+s+o)).toFixed(4);
    return isNaN(b)&&(b=0),isNaN(c)&&(c=0),[b,c]}

message = "263,80,100";
var params=message.split(","),result={},rgb=ScaledHSVtoRGB(params[0],params[1],100),xy=rgb_to_cie(rgb.r,rgb.g,rgb.b);
result.color={x:xy[0],y:xy[1]};
var b=2.54*params[2];
result.brightness=b;
console.log(JSON.stringify(result));
