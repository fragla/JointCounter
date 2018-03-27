/**
 * Represents a joint assessment canvas
 * @constructor
 * @param {object} canvas - A joint counting canvas object.
 * @param {string} type - The assessment type.
 * @param {object} colors - The colors for the joints. border, selected and unselected colors required.
 * @param {number} scale - Scale of the canvas in relation to the original image.
 */
function ArthritisJointAssessmentCanvas(canvas, type, colors, scale, selected) {
	this.canvas = canvas;
	this.colors = colors;
	this.scale  = scale; //canvas.width / 744;
	this.playSound = true;
	this.assessment = new ArthritisJointAssessment(type, selected);
	this.locations = initializeLocations(this.scale);

	draw(this.canvas, this.assessment.joints, this.assessment.type, this.colors, this.locations, this.scale);
	addJointSelectionListenerToCanvas(this.canvas, this.assessment.joints, this.colors, this.locations, this.playSound);
	addJointHoverListenerToCanvas(this.canvas, this.assessment.joints, { x:30, y:40, width:230, height:100 }, this.scale, this.locations);

	/**
	 * @param {number} scale
	 * @returns {object}
	 */
	function initializeLocations(scale) {
		locations = jointLocations();
		for (var key in locations) {
			locations[key].x = Math.round(locations[key].x * scale);
			locations[key].y = Math.round(locations[key].y * scale);
			locations[key].radius = Math.round(locations[key].radius * scale);
		}
		return(locations);
	}

	/**
	 * @param {object} canvas
	 * @param {array} joints
	 * @param {object} colors
	 * @param {object} locations
	 * @param {number} scale
	 */
	function draw(canvas, joints, type, colors, locations, scale) {
		var ctx = canvas.getContext('2d'); 
		
		var img = new Image();
	  	img.onload = function() { 
	  		ctx.canvas.width = img.width * scale;
			ctx.canvas.height = img.height * scale;
	    	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	    	joints.forEach(function(joint) {
	    		drawArc(ctx, locations[joint.id].x, locations[joint.id].y, locations[joint.id].radius, colors.border, joint.selected == 1 ? colors.selected : colors.unselected);
	    	});
	    	setJointCount(canvas, type, joints, scale);
	  	};
	  	img.src = getImage();
	}

	/**
	 * @param {object} ctx
	 * @param {number} xPos
	 * @param {number} yPos
	 * @param {number} radius
	 * @param {string} lineColor
	 * @param {string} fillColor
	 */
	function drawArc(ctx, xPos, yPos, radius, lineColor, fillColor)	{
		var radius = radius;
		ctx.strokeStyle = lineColor;
		ctx.fillStyle   = fillColor;
		ctx.beginPath();
		ctx.arc(xPos, yPos, radius,	0, 2*Math.PI, false);
		ctx.fill();
		ctx.stroke();
	}

	/**
	 * @param {object} canvas
	 * @param {string} type
	 * @param {array} joints
	 * @param {number} scale
	 */
	function setJointCount(canvas, type, joints, scale) {
		var selectedJoints = joints.filter(function(joint){
  			return joint.selected == 1;
		})
		writeMessage(canvas, type.toUpperCase() + " " + selectedJoints.length + " / " + joints.length, {x:480, y:40, width:200, height:100}, scale);
	}

	/**
	 * @param {object} point
	 * @param {object} circle
	 * @returns {boolean}
	 */
	function isIntersect(point, circle) {
	  return Math.sqrt(Math.pow(point.x-circle.x, 2) + Math.pow(point.y - circle.y, 2)) < circle.radius;
	}

	/*
	 * @param {object} canvas
	 * @param {array} joints
	 * @param {object} colors
	 * @param {object} locations
	 * @param {boolean} playSound
	 */
	function addJointSelectionListenerToCanvas(canvas, joints, colors, locations, playSound) {
		var playlist = [new Audio('resources/audio/ouch.mp3'), new Audio('resources/audio/getoff.mp3')];
		canvas.addEventListener("click", function(e){
			var ctx = canvas.getContext('2d');
		    const pos = {
		    	x: e.pageX-canvas.offsetLeft,
		      	y: e.pageY-canvas.offsetTop
		    };
		    joints.forEach(joint => {
		    	if (isIntersect(pos, locations[joint.id])) {
		        	if(joint.selected==0) {
		          		drawArc(ctx, locations[joint.id].x, locations[joint.id].y, locations[joint.id].radius, colors.border, colors.selected);
		          		joint.selected=1;
		          		if(playSound && Math.floor(Math.random() * 5) % 5 == 0) {
		            		playlist[Math.floor(Math.random() * 2)].play();
		          		}
		        	} else {
		          		drawArc(ctx, locations[joint.id].x, locations[joint.id].y, locations[joint.id].radius, colors.border, colors.unselected);
		          		joint.selected=0;
		        	}
		      	}
		      	setJointCount(canvas, type, joints, scale);
		    });
		    //alert(canvas.toDataURL());
		});
	}

	/*
	 * @params {object} canvas
	 * @params {array} joints
	 * @params {number} scale
	 * @params {object} locations
	 */
	function addJointHoverListenerToCanvas(canvas, joints, coord, scale, locations) {
		canvas.addEventListener("mousemove", function(e){
			ctx = canvas.getContext('2d');
			const pos = {
				x: e.pageX-canvas.offsetLeft,
			    y: e.pageY-canvas.offsetTop
			};
			for(i=0; i<joints.length; i++) {
			  	joint = joints[i];
			    if (isIntersect(pos, locations[joint.id])) {
			    	var message = joint.name;
			      	writeMessage(canvas, message, coord, scale);
			      	break;
			    } else {
			      	writeMessage(canvas, "      ", coord, scale);
			    }
			}


		});
	}

	/*
	 * @params {object} canvas
	 * @params {string} message
	 * @params {number} scale
	 */
	function writeMessage(canvas, message, coord, scale) {
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = "white";
		ctx.fillRect(Math.round(coord.x*scale), Math.round(coord.y*scale), Math.round(coord.width*scale), Math.round(coord.height*scale));
		if(message != "") {
		   	ctx.fillStyle = "black";
		   	ctx.font = Math.round(20 * scale) + "pt sans-serif";
		   	ctx.fillText(message, Math.round((coord.x+5)*scale), Math.round(100*scale));
		 }
	}


	/*
	 * @returns {array}
	 */
	function jointLocations() {
		var locations = {
		  1 : {x:320, y:80, radius:15},
		  2 : {x:420, y:80, radius:15},
		  3 : {x:270, y:170, radius:15},
		  4 : {x:298, y:155, radius:15},
		  5 : {x:356, y:150, radius:15},
		  6 : {x:389, y:150, radius:15},
		  7 : {x:442, y:155, radius:15},
		  8 : {x:470, y:170, radius:15},
		  9 : {x:267, y:320, radius:15},
		  10 : {x:477, y:320, radius:15},
		  11 : {x:222, y:425, radius:15},
		  12 : {x:298, y:410, radius:15},
		  13 : {x:447, y:410, radius:15},
		  14 : {x:522, y:425, radius:15},
		  15 : {x:267, y:625, radius:15},
		  16 : {x:340, y:610, radius:15},
		  17 : {x:405, y:610, radius:15},
		  18 : {x:472, y:625, radius:15},
		  19 : {x:105, y:625, radius:15},
		  20 : {x:127, y:650, radius:15},
		  21 : {x:155, y:685, radius:15},
		  22 : {x:190, y:700, radius:15},
		  23 : {x:278, y:690, radius:15},
		  24 : {x:464, y:690, radius:15},
		  25 : {x:552, y:700, radius:15},
		  26 : {x:587, y:685, radius:15},
		  27 : {x:615, y:650, radius:15},
		  28 : {x:637, y:625, radius:15},
		  29 : {x:75, y:660, radius:15},
		  30 : {x:105, y:690, radius:15},
		  31 : {x:141, y:720, radius:15},
		  32 : {x:183, y:745, radius:15},
		  33 : {x:339, y:760, radius:15},
		  34 : {x:405, y:760, radius:15},
		  35 : {x:560, y:745, radius:15},
		  36 : {x:602, y:720, radius:15},
		  37 : {x:638, y:690, radius:15},
		  38 : {x:668, y:660, radius:15},
		  39 : {x:50, y:695, radius:15},
		  40 : {x:72, y:730, radius:15},
		  41 : {x:117, y:770, radius:15},
		  42 : {x:170, y:780, radius:15},
		  43 : {x:573, y:780, radius:15},
		  44 : {x:626, y:770, radius:15},
		  45 : {x:671, y:730, radius:15},
		  46 : {x:693, y:695, radius:15},
		  47 : {x:300, y:850, radius:15},
		  48 : {x:444, y:850, radius:15},
		  49 : {x:215, y:900, radius:15},
		  50 : {x:247, y:913, radius:15},
		  51 : {x:279, y:927, radius:15},
		  52 : {x:311, y:940, radius:15},
		  53 : {x:347, y:955, radius:15},
		  54 : {x:397, y:955, radius:15},
		  55 : {x:433, y:940, radius:15},
		  56 : {x:465, y:927, radius:15},
		  57 : {x:497, y:913, radius:15},
		  58 : {x:529, y:900, radius:15},
		  59 : {x:210, y:940, radius:15},
		  60 : {x:242, y:953, radius:15},
		  61 : {x:272, y:967, radius:15},
		  62 : {x:304, y:980, radius:15},
		  63 : {x:340, y:995, radius:15},
		  64 : {x:404, y:995, radius:15},
		  65 : {x:440, y:980, radius:15},
		  66 : {x:472, y:967, radius:15},
		  67 : {x:504, y:953, radius:15},
		  68 : {x:536, y:940, radius:15},
		};
		return(locations);
	}

	/*
	 * @returns {string}
	 */
	function getImage() {
		return('resources/images/man-transparent.png');
	}
}

/**
 * Represents a joint assessment 
 * @constructor
 * @param {string} type - The assessment type.
 */
function ArthritisJointAssessment(type, selected) {
	this.type = type;
	this.joints = initializeJoints(this.type, selected);

	function initializeJoints(type, selected) {
		joints = joints();

		//set selected joints
		if(selected && selected != "") {
			var s = selected.split(';');
			for (var i = 0; i < s.length; i++) {
				var idx = s[i] - 1;
				joints[idx].selected = 1;
			}
		}

		if(type=="sjc") {
			joints = joints.filter(function(joint) { return ! joint.name.match(/hip/) });
		}
		
		return(joints);			
	}

	/* 
	 * @returns {array}
	 */
	function joints() {
		var joints = [
		  {id:1, name:'Right TMJ', selected:0},
		  {id:2, name:'Left TMJ', selected:0},
		  {id:3, name:'Right shoulder', selected:0},
		  {id:4, name:'Right AC', selected:0},
		  {id:5, name:'Right SC', selected:0},
		  {id:6, name:'Left SC', selected:0},
		  {id:7, name:'Left AC', selected:0},
		  {id:8, name:'Left shoulder', selected:0},
		  {id:9, name:'Right elbow', selected:0},
		  {id:10, name:'Left elbow', selected:0},
		  {id:11, name:'Right wrist', selected:0},
		  {id:12, name:'Right hip', selected:0},
		  {id:13, name:'Left hip', selected:0},
		  {id:14, name:'Left wrist', selected:0},
		  {id:15, name:'Right hand MCP 1', selected:0},
		  {id:16, name:'Right knee', selected:0},
		  {id:17, name:'Left knee', selected:0},
		  {id:18, name:'Left hand MCP 1', selected:0},
		  {id:19, name:'Right hand MCP 5', selected:0},
		  {id:20, name:'Right hand MCP 4', selected:0},
		  {id:21, name:'Right hand MCP 3', selected:0},
		  {id:22, name:'Right hand MCP 2', selected:0},
		  {id:23, name:'Right hand IP1', selected:0},
		  {id:24, name:'Left hand IP1', selected:0},
		  {id:25, name:'Left hand MCP 2', selected:0},
		  {id:26, name:'Left hand MCP 3', selected:0},
		  {id:27, name:'Left hand MCP 4', selected:0},
		  {id:28, name:'Left hand MCP 5', selected:0},
		  {id:29, name:'Right hand PIP 5', selected:0},
		  {id:30, name:'Right hand PIP 4', selected:0},
		  {id:31, name:'Right hand PIP 3', selected:0},
		  {id:32, name:'Right hand PIP 2', selected:0},
		  {id:33, name:'Right ankle', selected:0},
		  {id:34, name:'Left ankle', selected:0},
		  {id:35, name:'Left hand PIP 2', selected:0},
		  {id:36, name:'Left hand PIP 3', selected:0},
		  {id:37, name:'Left hand PIP 4', selected:0},
		  {id:38, name:'Left hand PIP 5', selected:0},
		  {id:39, name:'Right hand DIP 5', selected:0},
		  {id:40, name:'Right hand DIP 4', selected:0},
		  {id:41, name:'Right hand DIP 3', selected:0},
		  {id:42, name:'Right hand DIP 2', selected:0},
		  {id:43, name:'Left hand DIP 2', selected:0},
		  {id:44, name:'Left hand DIP 3', selected:0},
		  {id:45, name:'Left hand DIP 4', selected:0},
		  {id:46, name:'Left hand DIP 5', selected:0},
		  {id:47, name:'Right tarsus', selected:0},
		  {id:48, name:'Left tarsus', selected:0},
		  {id:49, name:'Right foot MTP 5', selected:0},
		  {id:50, name:'Right foot MTP 4', selected:0},
		  {id:51, name:'Right foot MTP 3', selected:0},
		  {id:52, name:'Right foot MTP 2', selected:0},
		  {id:53, name:'Right foot MTP 1', selected:0},
		  {id:54, name:'Left foot MTP 1', selected:0},
		  {id:55, name:'Left foot MTP 2', selected:0},
		  {id:56, name:'Left foot MTP 3', selected:0},
		  {id:57, name:'Left foot MTP 4', selected:0},
		  {id:58, name:'Left foot MTP 5', selected:0},
		  {id:59, name:'Right foot PIP 5', selected:0},
		  {id:60, name:'Right foot PIP 4', selected:0},
		  {id:61, name:'Right foot PIP 3', selected:0},
		  {id:62, name:'Right foot PIP 2', selected:0},
		  {id:63, name:'Right foot IP1', selected:0},
		  {id:64, name:'Left foot IP1', selected:0},
		  {id:65, name:'Left foot PIP 2', selected:0},
		  {id:66, name:'Left foot PIP 3', selected:0},
		  {id:67, name:'Left foot PIP 4', selected:0},
		  {id:68, name:'Left foot PIP 5', selected:0},
		];
		return(joints);
	}
}

/*
 * @returns {array}
 */
function initialize(selectedJoints) {
  	var canvases = document.getElementsByTagName("canvas");
  	var jc = document.getElementsByClassName("jc");
  	var assessments = [];

  	for (var i = 0; i < jc.length; i++) {     
  		var type = 'sjc';
  		if(jc[i].classList.contains('tjc')) {
  			type = 'tjc';
  		}

  		if(selectedJoints && selectedJoints.hasOwnProperty(type)) {
 			assessments.push(new ArthritisJointAssessmentCanvas(jc[i], type, { border:'green', selected:'green', unselected:'white'}, 0.5, selectedJoints[type]));
 		}
 		else {
 			assessments.push(new ArthritisJointAssessmentCanvas(jc[i], type, { border:'green', selected:'green', unselected:'white'}, 0.5));
 		}
  	}
  	return(assessments);
}
