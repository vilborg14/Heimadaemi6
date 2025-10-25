
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var movement = false;     
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var modelViewLoc;
var projectionLoc;
var projectionMatrix;

var normalsArray = [];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    window.program = program;


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    modelViewLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionLoc = gl.getUniformLocation( program, "projectionMatrix" );
    projectionMatrix = perspective( 50.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix) );

    var lightPosition = vec4( 1.0, 1.0, 2.0, 0.0 );
    var lightAmbient  = vec4( 0.2, 0.2, 0.2, 1.0 );
    var lightDiffuse  = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );


    var materialAmbient  = vec4(1.0, 0.6, 0.8, 1.0);
    var materialDiffuse  = vec4(1.0, 0.6, 0.8, 1.0);
    var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    var shininess        = 75.0;

    var ambientProduct  = mult( lightAmbient,  materialAmbient  );
    var diffuseProduct  = mult( lightDiffuse,  materialDiffuse  );
    var specularProduct = mult( lightSpecular, materialSpecular );

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),  flatten(ambientProduct)  );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),  flatten(diffuseProduct)  );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),    flatten(lightPosition)   );
    gl.uniform1f ( gl.getUniformLocation(program, "shininess"),        shininess );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    //random litur þegar ýtt með mús!
    canvas.addEventListener("click", function() {
        var r = 0.7 + Math.random() * 0.3;
        var g = 0.7 + Math.random() * 0.3;
        var b = 0.7 + Math.random() * 0.3;
        var newColor = vec4(r, g, b, 1.0);

        var lightAmbient  = vec4(0.2, 0.2, 0.2, 1.0);
        var lightDiffuse  = vec4(1.0, 1.0, 1.0, 1.0);
        var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

        var ambientProduct  = mult(lightAmbient,  newColor);
        var diffuseProduct  = mult(lightDiffuse,  newColor);
        var specularProduct = mult(lightSpecular, vec4(1.0, 1.0, 1.0, 1.0)); 

        gl.uniform4fv(gl.getUniformLocation(window.program, "ambientProduct"),  flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(window.program, "diffuseProduct"),  flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(window.program, "specularProduct"), flatten(specularProduct));

        console.log("Nýr litur:", r.toFixed(2), g.toFixed(2), b.toFixed(2));
    });


    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  

     
       
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var indices = [ a, b, c, a, c, d ];

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = normalize(cross(t1, t2));

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push( normal );
    }
}






function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

   
    mv1 = mult( mv, translate( -0.4, 0.0, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.04, 0.8, 0.5 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.4, 0.0, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.04, 0.8, 0.5 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.0, 0.38, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.04, 0.5 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.0, -0.38, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.04, 0.5 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    mv1 = mult( mv, scalem( 0.8, 0.015, 0.5 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, scalem( 0.015, 0.8, 0.5 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
