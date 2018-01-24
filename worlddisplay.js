function Chunk() {
    this.size = {"x": 16, "y": 16, "z": 16}
    this.materialType = "basic";
    this.file = {};
    this.geo = new THREE.Group;

    this.display = function() {
        // remove the old geometry from the scene
            scene.remove(this.geo);
        // reset all meshes from the previous generation
    	   this.file.meshes = [];
        // store all meshes in this group
            this.geo = new THREE.Group;

        // iterate through all meshes found in the file variable
    	if (this.file.type == "limited") {
    		this.file.meshes = new Array(this.file.data.length);
    		for (var x = 0; x < this.file.data.length; x++) {
    			this.file.meshes[x] = new Array(this.file.data[x].length);
    			for (var y = 0; y < this.file.data[x].length; y++) {
    				this.file.meshes[x][y] = new Array(this.file.data[x][y].length);
    				for (var z = 0; z < this.file.data[x][y].length; z++) {
    					if (this.file.material[this.file.data[x][y][z]-1]=="") {
                            // if a slot in the file points to a nonexistent material, this block is reset to 0
    						this.file.data[x][y][z] = 0;
    					}
    					else if (this.file.data[x][y][z] != 0) {
    						// addCube(m,this.file.data[x][y][z],x,y,z,false,size);
            				// var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( this.size.x, this.size.y, this.size.z ), new THREE.MeshBasicMaterial( { color: 0xff00bb } ) );
                            var mesh = this.genVoxel(this.file.material[ this.file.data[x][y][z]-1 ], this.size.x,this.size.y,this.size.z);
                            mesh.position.set(this.position.x+x*this.size.x, this.position.y+y*this.size.y, this.position.z+z*this.size.z);
            				this.geo.add( mesh );
    					}
    				}
    			}
    		}
    		scene.add(this.geo);
    	}else {
    		console.warn("unsupported map.type. Couldn't load map");
    	}
    }
    this.render = function() {
        var parent = this;
        this.bulkAtlasifier(this.file.material, function(atlases) {
            parent.geo = new THREE.Group();
            for (var i = 0; i < atlases.length; i++) {
                var texture = new THREE.TextureLoader().load( atlases[i].src );
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                parent.geo.add(new THREE.Mesh(parent.meshify(i+1), new THREE.MeshBasicMaterial({ map: texture, transparent: true})));
            }
            scene.add( parent.geo );
        })
    }
    this.meshify = function(material) {
        // meshify all voxels with the same material into the same mesh
        // IF there is no value passed as the material parameter, all voxels are meshified together
        var matrix = new THREE.Matrix4();

        var pxGeometry = new THREE.PlaneBufferGeometry( this.size.z, this.size.y );
        pxGeometry.attributes.uv.array[ 1 ] = 8/8;
        pxGeometry.attributes.uv.array[ 3 ] = 8/8;
		pxGeometry.attributes.uv.array[ 5 ] = 7/8;
		pxGeometry.attributes.uv.array[ 7 ] = 7/8;
		pxGeometry.rotateY( Math.PI / 2 );
		pxGeometry.translate( this.size.x/2, 0, 0 );
		var nxGeometry = new THREE.PlaneBufferGeometry( this.size.z, this.size.y );
        nxGeometry.attributes.uv.array[ 1 ] = 7/8;
        nxGeometry.attributes.uv.array[ 3 ] = 7/8;
		nxGeometry.attributes.uv.array[ 5 ] = 6/8;
		nxGeometry.attributes.uv.array[ 7 ] = 6/8;
		nxGeometry.rotateY( - Math.PI / 2 );
		nxGeometry.translate( - this.size.x/2, 0, 0 );
		var pyGeometry = new THREE.PlaneBufferGeometry( this.size.x, this.size.z );
        pyGeometry.attributes.uv.array[ 1 ] = 6/8;
        pyGeometry.attributes.uv.array[ 3 ] = 6/8;
		pyGeometry.attributes.uv.array[ 5 ] = 5/8;
		pyGeometry.attributes.uv.array[ 7 ] = 5/8;
		pyGeometry.rotateX( - Math.PI / 2 );
		pyGeometry.translate( 0, this.size.y/2, 0 );
        var nyGeometry = new THREE.PlaneBufferGeometry( this.size.x, this.size.z );
        nyGeometry.attributes.uv.array[ 1 ] = 5/8;
        nyGeometry.attributes.uv.array[ 3 ] = 5/8;
		nyGeometry.attributes.uv.array[ 5 ] = 4/8;
		nyGeometry.attributes.uv.array[ 7 ] = 4/8;
		nyGeometry.rotateX( Math.PI / 2 );
		nyGeometry.translate( 0, - this.size.y/2, 0 );
		var pzGeometry = new THREE.PlaneBufferGeometry( this.size.x, this.size.y );
        pzGeometry.attributes.uv.array[ 1 ] = 2/8;
        pzGeometry.attributes.uv.array[ 3 ] = 2/8;
		pzGeometry.attributes.uv.array[ 5 ] = 1/8;
		pzGeometry.attributes.uv.array[ 7 ] = 1/8;
		pzGeometry.translate( 0, 0, this.size.z/2 );
		var nzGeometry = new THREE.PlaneBufferGeometry( this.size.x, this.size.y );
        nzGeometry.attributes.uv.array[ 1 ] = 1/8;
        nzGeometry.attributes.uv.array[ 3 ] = 1/8;
		nzGeometry.rotateY( Math.PI );
		nzGeometry.translate( 0, 0, -this.size.z/2 );

		// BufferGeometry cannot be merged yet.
		var tmpGeometry = new THREE.Geometry();
		var pxTmpGeometry = new THREE.Geometry().fromBufferGeometry( pxGeometry );
		var nxTmpGeometry = new THREE.Geometry().fromBufferGeometry( nxGeometry );
		var pyTmpGeometry = new THREE.Geometry().fromBufferGeometry( pyGeometry );
        var nyTmpGeometry = new THREE.Geometry().fromBufferGeometry( nyGeometry );
		var pzTmpGeometry = new THREE.Geometry().fromBufferGeometry( pzGeometry );
		var nzTmpGeometry = new THREE.Geometry().fromBufferGeometry( nzGeometry );

        for (var x = 0; x < this.file.data.length; x++) {
            for (var y = 0; y < this.file.data[x].length; y++) {
                for (var z = 0; z < this.file.data[x][y].length; z++) {
                    matrix.makeTranslation(
						x * (this.size.x),
						y * (this.size.y),
						z * (this.size.z)
					);
                    if (typeof material != "undefined" ? this.file.data[x][y][z] == material : this.file.data[x][y][z] != 0) {
                        // see if the block left from this one is free.
                        // if so, show the face of this voxel to that side
                        if (typeof this.file.data[x-1] !== "undefined") {
                            if (this.file.data[x-1][y][z] == 0 || this.file.material[this.file.data[x-1][y][z]-1].opacity < 1 && this.file.data[x][y][z] != this.file.data[x-1][y][z]) {
                                tmpGeometry.merge( nxTmpGeometry, matrix );
                            }
                        }else {
                            tmpGeometry.merge( nxTmpGeometry, matrix );
                        }
                        // see if the block right from this one is free.
                        // if so, show the face of this voxel to that side
                        if (typeof this.file.data[x+1] !== "undefined") {
                            if (this.file.data[x+1][y][z] == 0 || this.file.material[this.file.data[x+1][y][z]-1].opacity < 1 && this.file.data[x][y][z] != this.file.data[x+1][y][z]) {
                                tmpGeometry.merge( pxTmpGeometry, matrix );
                            }
                        }else {
                            tmpGeometry.merge( pxTmpGeometry, matrix );
                        }
                        // see if the block top from this one is free.
                        // if so, show the face of this voxel to that side
                        if (typeof this.file.data[x][y+1] !== "undefined") {
                            if (this.file.data[x][y+1][z] == 0 || this.file.material[this.file.data[x][y+1][z]-1].opacity < 1 && this.file.data[x][y][z] != this.file.data[x][y+1][z]) {
                                tmpGeometry.merge( pyTmpGeometry, matrix );
                            }
                        }else {
                            tmpGeometry.merge( pyTmpGeometry, matrix );
                        }
                        // see if the block bottom from this one is free.
                        // if so, show the face of this voxel to that side
                        if (typeof this.file.data[x][y-1] !== "undefined") {
                            if (this.file.data[x][y-1][z] == 0 || this.file.material[this.file.data[x][y-1][z]-1].opacity < 1 && this.file.data[x][y][z] != this.file.data[x][y-1][z]) {
                                tmpGeometry.merge( nyTmpGeometry, matrix );
                            }
                        }else {
                            tmpGeometry.merge( nyTmpGeometry, matrix );
                        }
                        // see if the block front from this one is free.
                        // if so, show the face of this voxel to that side
                        if (typeof this.file.data[x][y][z+1] !== "undefined") {
                            if (this.file.data[x][y][z+1] == 0 || this.file.material[this.file.data[x][y][z+1]-1].opacity < 1 && this.file.data[x][y][z] != this.file.data[x][y][z+1]) {
                                tmpGeometry.merge( pzTmpGeometry, matrix );
                            }
                        }else {
                            tmpGeometry.merge( pzTmpGeometry, matrix );
                        }
                        // see if the block back from this one is free.
                        // if so, show the face of this voxel to that side
                        if (typeof this.file.data[x][y][z-1] !== "undefined") {
                            if (this.file.data[x][y][z-1] == 0 || this.file.material[this.file.data[x][y][z-1]-1].opacity < 1 && this.file.data[x][y][z] != this.file.data[x][y][z-1]) {
                                tmpGeometry.merge( nzTmpGeometry, matrix );
                            }
                        }else {
                            tmpGeometry.merge( nzTmpGeometry, matrix );
                        }
                    }
                }
            }
        }
        var geometry = new THREE.BufferGeometry().fromGeometry( tmpGeometry );
		geometry.computeBoundingSphere();
        return geometry;
    }
    this.addCube = function(material, x,y,z, neighbourCheck){
        // neighbourCheck check bordering voxels and remove shared faces → fps boost
    }
    this.remCube = function(x,y,z, neighbourCheck){
        // neighbourCheck check bordering voxels and remove shared faces → fps boost
    }
    this.bulkAtlasifier = function (materials, callback) {
        // enter an array full of materials and return each of them converted to an atlas in an array
        var output = []
        for (var i = 0; i < materials.length; i++) {
            this.jsonToAtlas(materials[i],function(e,space) {
                updateOutput(space, e);
            }, i);
        }
        function updateOutput(space, atlas) {
            output[space] = atlas;
            var size = output.filter(() => true).length;
            if (size >= materials.length) {
                callback(output);
            }
        }
    }
    this.jsonToAtlas = function (material, callback, args) {
        // take in a material as json format and convert it into an image atlas
        // args just passes on additional arguments into the callback
        var right = new Image();
            right.src = material.f.right;
            right.onload = function(){
                var left = new Image();
                    left.src = material.f.left;
                    left.onload = function(){
                        var top = new Image();
                            top.src = material.f.top;
                            top.onload = function(){
                                var bottom = new Image();
                                    bottom.src = material.f.bottom;
                                    bottom.onload = function(){
                                        var front = new Image();
                                            front.src = material.f.front;
                                            front.onload = function(){
                                                var back = new Image();
                                                    back.src = material.f.back;
                                                    back.onload = function(){
                                                        // repeat front & back, in order to get an image with a power of 2 size
                                                        callback(atlasify([right,left,top,bottom,front,back,front,back], material.opacity), args);
                                                    }
                                            }
                                    }
                            }
                    }
            }
    }
    this.cubeTextureLoader = function(material){
        var texture = {};
        texture.right = new THREE.TextureLoader().load( material.f.right );
        texture.left = new THREE.TextureLoader().load( material.f.left );
        texture.top = new THREE.TextureLoader().load( material.f.top );
        texture.bottom = new THREE.TextureLoader().load( material.f.bottom );
        texture.front = new THREE.TextureLoader().load( material.f.front );
        texture.back = new THREE.TextureLoader().load( material.f.back );
        texture.front.magFilter = texture.back.magFilter = texture.left.magFilter = texture.right.magFilter = texture.top.magFilter = texture.bottom.magFilter = THREE.NearestFilter;
        texture.front.minFilter = texture.back.minFilter = texture.left.minFilter = texture.right.minFilter = texture.top.minFilter = texture.bottom.minFilter = THREE.NearestFilter;
        texture.front.wrapT = texture.back.wrapT = texture.left.wrapT = texture.right.wrapT = texture.top.wrapT = texture.bottom.wrapT = THREE.RepeatWrapping;
        texture.front.wrapS = texture.back.wrapS = texture.left.wrapS = texture.right.wrapS = texture.top.wrapS = texture.bottom.wrapS = THREE.RepeatWrapping;
        return texture;
    }
    this.materialize = function(type, texture, opacity){
        var material = {};
        if (type == "lambert") {
            material.right = new THREE.MeshLambertMaterial( { map: texture.right, transparent: true, opacity: opacity } )
            material.left = new THREE.MeshLambertMaterial( { map: texture.left, transparent: true, opacity: opacity } )
            material.top = new THREE.MeshLambertMaterial( { map: texture.top, transparent: true, opacity: opacity } )
            material.bottom = new THREE.MeshLambertMaterial( { map: texture.bottom, transparent: true, opacity: opacity } );
            material.front = new THREE.MeshLambertMaterial( { map: texture.front, transparent: true, opacity: opacity } )
            material.back = new THREE.MeshLambertMaterial( { map: texture.back, transparent: true, opacity: opacity } )
        }else {
            material.right = new THREE.MeshBasicMaterial( { map: texture.right, transparent: true, opacity: opacity } )
            material.left = new THREE.MeshBasicMaterial( { map: texture.left, transparent: true, opacity: opacity } )
            material.top = new THREE.MeshBasicMaterial( { map: texture.top, transparent: true, opacity: opacity } )
            material.bottom = new THREE.MeshBasicMaterial( { map: texture.bottom, transparent: true, opacity: opacity } );
            material.front = new THREE.MeshBasicMaterial( { map: texture.front, transparent: true, opacity: opacity } )
            material.back = new THREE.MeshBasicMaterial( { map: texture.back, transparent: true, opacity: opacity } )
        }
        return material;
    }
    this.genVoxel = function(material, width,height,depth){
    	if (material.type == "cube") {
    		var texture = this.cubeTextureLoader(material);
            var material4mesh = this.materialize(this.materialType, texture, material.opacity);
            var geometry = new THREE.BoxBufferGeometry( width, height, depth );
    		var mesh = new THREE.Mesh( geometry, [material4mesh.right,material4mesh.left,material4mesh.top,material4mesh.bottom,material4mesh.front,material4mesh.back] );
    	}
    	mesh.rotation.x = Math.PI*0.5 * material.r.x;
    	mesh.rotation.y = Math.PI*0.5 * material.r.y;
    	mesh.rotation.z = Math.PI*0.5 * material.r.z;
    	return mesh;
    }
}

function atlasify (images, opacity) {
    // add several images into one big image for use as an image atlas
    var workingCanvas = document.createElement("canvas");
    workingCanvas.style.display = "none";
    workingCanvas.width = images[0].width;
    workingCanvas.height = images[0].height * images.length;
    var workingCtx = workingCanvas.getContext("2d");
    workingCtx.globalAlpha = opacity;
    for (var i = 0; i < images.length; i++) {
        workingCtx.drawImage(images[i],0,images[0].height*i,images[0].width, images[0].height);
    }
    var image = new Image();
    image.src = workingCanvas.toDataURL("image/png");
    return image;
}
