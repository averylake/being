'use strict';
// Encoded-account material study 1. Token-derived contours, authored pigment mapping.
// Adapted from the Signals texture renderer. Original texture bytes are unchanged.
function createTokenMaterialRenderer(onReady,onError,options={}){
 const surface=document.createElement('canvas'),gl=surface.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:false});
 const renderer={canvas:surface,ready:false,setEntries(){},updateEntry(){},draw(){}};
 if(!gl){onError('This moving work needs WebGL 2. Try a current browser with graphics acceleration enabled.');return renderer;}
 const fragment=`#version 300 es
 precision highp float;
 precision highp int;
 uniform sampler2D patterns;
 uniform int patternWidth;
 flat in vec4 instance;
 out vec4 outputColor;
 vec4 pattern(int block){int flatIndex=int(instance.z)*10+block;return texelFetch(patterns,ivec2(flatIndex%patternWidth,flatIndex/patternWidth),0);}
 flat in vec3 pose;

 uniform sampler2D atlas;
 uniform vec2 resolution;
 uniform float time;
 uniform float breathing;
 
 const float TAU=6.28318530718;
 vec2 current(vec2 q,float phase,float k){
   float a=5.2*q.x+3.7*q.y+phase+.9*k;
   float b=-3.8*q.x+6.1*q.y-1.3*phase+1.4*k;
   float c=8.7*q.x-4.3*q.y+1.7*phase+.3*k;
   return vec2(.013*3.7*cos(a)+.008*6.1*cos(b)-.0025*4.3*cos(c),-.013*5.2*cos(a)+.008*3.8*cos(b)-.0025*8.7*cos(c));
 }
 void main(){
   float seed[32];float voice[8];
   for(int i=0;i<8;i++){vec4 block=pattern(i);seed[i*4]=block.x;seed[i*4+1]=block.y;seed[i*4+2]=block.z;seed[i*4+3]=block.w;}
   for(int i=0;i<2;i++){vec4 block=pattern(i+8);voice[i*4]=block.x;voice[i*4+1]=block.y;voice[i*4+2]=block.z;voice[i*4+3]=block.w;}
   vec2 center=pose.xy;float size=pose.z,opacity=instance.x,side=instance.y,trace=instance.w;

   vec2 pixel=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y);
   vec2 q=(pixel-center)/size;
   float phase=time*.19635,k=seed[5]*2.;
   float rotation=voice[6]+(seed[9]-.5)*1.35+.055*sin(phase+k)+.019*sin(phase*.61+seed[1]*TAU);
   float c=cos(rotation),s=sin(rotation);
   q=vec2(c*q.x+s*q.y,-s*q.x+c*q.y);
   q/=vec2(.88+.20*seed[3],.86+.22*seed[4]);
   float facing=exp(-9.*dot(q-vec2(-side*.3,0.),q-vec2(-side*.3,0.)));
   float strength=.40+trace*.13*voice[6];
   vec2 mid=q-.5*strength*current(q,phase,k);
   vec2 uv=q-strength*current(mid,phase,k);
   float r=length(uv),a=atan(uv.y,uv.x);
   // Fixed name contours and continuous surface currents are separate terms.
   float folds=.050*(.3+seed[17])*sin(2.*a+seed[18]*TAU)
             +.043*(.3+seed[19])*sin(3.*a+seed[20]*TAU)
             +.033*(.3+seed[21])*sin(5.*a+seed[22]*TAU)
             +.024*(.3+seed[23])*sin(7.*a+seed[24]*TAU)
             +.017*(.3+seed[25])*sin(9.*a+seed[26]*TAU)
             +.012*(.3+seed[27])*sin(11.*a+seed[28]*TAU);
   folds+=trace*(.065*voice[0]*sin(2.*a+seed[18]*TAU)+.045*voice[1]*sin(4.*a+seed[20]*TAU)+.025*voice[2]*sin(9.*a+seed[26]*TAU));
   float nameWarp=(folds*.55+(seed[0]-.5)*.12*sin(3.*a+seed[1]*TAU)+(seed[2]-.5)*.10*cos(2.*a+seed[6]*TAU));
   float twist=trace*.06*voice[7]*sin(3.*a+phase*.4)+.05*sin(2.*phase+7.*r+k)+.02*sin(phase+12.*r-k)+(seed[16]-.5)*.2;
   uv=vec2(cos(twist)*uv.x-sin(twist)*uv.y,sin(twist)*uv.x+cos(twist)*uv.y);
   uv*=1.+nameWarp+.014*(seed[10]-.5)*sin(13.*a+seed[11]*TAU)+.022*sin(3.*a-phase+k)+.012*sin(5.*a+phase*1.3+k);
   // The acknowledged phase also changes the opening, without replacing the material.
   uv*=1.-breathing*.09*exp(-pow((length(uv)-.24)/.18,2.));
   // Thin and open the same fluid material, rather than adding flat graphic symbols.
   float materialRadius=length(uv);
   uv+=.5;
   if(uv.x<=.003||uv.x>=.997||uv.y<=.003||uv.y>=.997){outputColor=vec4(0.,0.,0.,1.);return;}
   vec3 warm=texture(atlas,vec2(uv.x*.5,uv.y)).rgb;
   vec3 cool=texture(atlas,vec2((uv.x+1.)*.5,uv.y)).rgb;
   float family=smoothstep(.44,.56,seed[14]);
   vec3 color=mix(warm,cool,family);
   color=max(color-vec3(.007),vec3(0.))/.993;
   // Fine moving filaments follow a circular phase field, never a row of glyphs.
   float wave=r*(110.+75.*seed[29]+trace*90.*voice[4])+4.*sin(a*(3.+floor(seed[7]*4.))+seed[30]*TAU)+phase*.3;
   float filament=pow(.5+.5*sin(wave),24.);
   float fine=pow(.5+.5*sin(r*(190.+80.*seed[13])+6.*sin(5.*a+seed[12]*TAU)-phase*.21),30.);
   float notchAngle=atan(sin(a-seed[31]*TAU),cos(a-seed[31]*TAU));
   float interruption=exp(-pow(notchAngle/(.035+.08*seed[8]),2.))*smoothstep(.22,.42,r);
   color*=1.-(.2+.3*seed[15]+trace*.16*voice[5])*interruption;
   color+=color*((.12+trace*.45*voice[2])*filament+(.06+trace*.45*voice[3])*fine);
   float gain=.94+.025*sin(2.*phase+2.*a+k)+.015*sin(3.*phase+14.*r-2.*a);
   // Monochrome display adaptation; original texture bytes remain unchanged.
   vec3 lit=clamp(color*gain*opacity,0.,1.);
   float grey=mix(dot(lit,vec3(.2126,.7152,.0722)),max(lit.r,max(lit.g,lit.b)),.35);
   grey=clamp(pow(grey,.88)*1.06,0.,1.);
   // Pigments are an authored mapping, not an inference about lived experience.
   vec3 pigmentA=vec3(voice[0],voice[1],voice[2]);
   vec3 pigmentB=vec3(voice[3],voice[4],voice[5]);
   float passage=.18+.16*sin(a+phase*.4+seed[2]*TAU);
   vec3 tint=mix(pigmentA,pigmentB,passage);
   float grain=fract(sin(dot(floor(uv*1200.),vec2(12.9898,78.233))+voice[7]*79.13)*43758.54);
   grey*=.975+.05*grain;
   outputColor=vec4(clamp(grey*(tint*1.16+vec3(.04)*grey*grey),0.,1.),1.);
 }`;
 try{
 const vertex=`#version 300 es
 precision highp float;
 in vec2 corner;in vec3 aPose;in vec4 aInstance;uniform vec2 resolution;
 flat out vec3 pose;flat out vec4 instance;
 void main(){pose=aPose;instance=aInstance;vec2 pixel=aPose.xy+corner*aPose.z*.80;gl_Position=vec4(pixel.x/resolution.x*2.-1.,1.-pixel.y/resolution.y*2.,0.,1.);}`;
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const corner=gl.getAttribLocation(program,'corner');gl.enableVertexAttribArray(corner);gl.vertexAttribPointer(corner,2,gl.FLOAT,false,0,0);
 const instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,instances);
 const pose=gl.getAttribLocation(program,'aPose'),extra=gl.getAttribLocation(program,'aInstance');
 gl.enableVertexAttribArray(pose);gl.vertexAttribPointer(pose,3,gl.FLOAT,false,28,0);gl.vertexAttribDivisor(pose,1);
 gl.enableVertexAttribArray(extra);gl.vertexAttribPointer(extra,4,gl.FLOAT,false,28,12);gl.vertexAttribDivisor(extra,1);
 const loc={};for(const key of ['resolution','time','patternWidth','breathing'])loc[key]=gl.getUniformLocation(program,key);
 const atlas=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(program,'atlas'),0);
 const table=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,table);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(program,'patterns'),1);
 const tableWidth=320;gl.uniform1i(loc.patternWidth,tableWidth);let count=0,data=new Float32Array(0),poses=new Float32Array(0);
 const pack=(entry,dest,offset)=>{dest.set(entry.p,offset);dest.set(entry.voice?.features||new Float32Array(8),offset+32);};
 renderer.setEntries=entries=>{
  const height=Math.max(1,Math.ceil(entries.length/32));if(height>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw Error('This field exceeds this device’s texture capacity. Split it into smaller fields.');
  const next=new Float32Array(tableWidth*height*4);entries.forEach((e,i)=>pack(e,next,i*40));
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,table);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,tableWidth,height,0,gl.RGBA,gl.FLOAT,next);
  if(gl.getError()!==gl.NO_ERROR)throw Error('This device could not allocate the whole field. Try a smaller document. No entries were dropped.');
  count=entries.length;data=next;poses=new Float32Array(count*7);
 };
 renderer.updateEntry=(index,entry)=>{if(index>=count)return;const offset=index*40;pack(entry,data,offset);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,table);gl.texSubImage2D(gl.TEXTURE_2D,0,(index%32)*10,Math.floor(index/32),10,1,gl.RGBA,gl.FLOAT,data.subarray(offset,offset+40));};
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_COLOR);
 renderer.draw=(width,height,time,forms,breath=0)=>{
  if(!renderer.ready||forms.length!==count)return;
  if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;gl.viewport(0,0,width,height);}
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(loc.resolution,width,height);gl.uniform1f(loc.time,time);gl.uniform1f(loc.breathing,breath);
  for(let i=0;i<count;i++){const f=forms[i],offset=i*7;poses[offset]=f.x;poses[offset+1]=f.y;poses[offset+2]=f.size;poses[offset+3]=f.opacity;poses[offset+4]=f.side;poses[offset+5]=i;poses[offset+6]=f.strength||0;}
  gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferData(gl.ARRAY_BUFFER,poses,gl.DYNAMIC_DRAW);gl.drawArraysInstanced(gl.TRIANGLES,0,6,count);
 };
 const image=new Image();image.onload=()=>{gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);renderer.ready=true;onReady();};image.onerror=()=>onError('The artwork texture could not load. Please reload.');image.src=options.texturePath||'assets/contact-palette.png';
 surface.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer.ready=false;onError('The graphics context was interrupted. Your field remains in this page; try a smaller field or reload.');});
 }catch(error){onError('The moving work could not start in this browser.');console.error(error);}
 return renderer;
}
