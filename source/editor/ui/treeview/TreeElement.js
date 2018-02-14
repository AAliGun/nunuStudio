"use strict";

function TreeElement(container)
{
	//Container
	this.container = container;

	//Attributes
	this.size = new THREE.Vector2(0,0);
	this.position = new THREE.Vector2(0,0);
	this.visible = true;

	//Object attached
	this.obj = null;
	this.uuid = null;
	this.folded = false;

	//Children and parent elements
	this.parent = null;
	this.children = [];
	this.level = 0;

	//Element
	this.element = document.createElement("div");
	this.element.style.position = "absolute";
	this.element.draggable = true;
	this.element.style.left = "0px";
	this.element.style.height = "20px";
	this.element.style.width = "100%";
	this.element.style.cursor = "pointer";
	this.element.style.boxSizing = "border-box";
	this.container.element.appendChild(this.element);

	//Arrow
	this.arrow = document.createElement("img");
	this.arrow.draggable = false;
	this.arrow.src = Editor.filePath + "icons/misc/arrow_down.png";
	this.arrow.style.position = "absolute";
	this.arrow.style.opacity = 0.5;
	this.arrow.style.width = "15px";
	this.arrow.style.height = "15px";
	this.arrow.style.left = "5px";
	this.arrow.style.top = "3px";
	this.element.appendChild(this.arrow);

	//Icon
	this.icon = document.createElement("img");
	this.icon.src = Editor.filePath + "icons/misc/arrow_down.png";
	this.icon.style.position = "absolute";
	this.icon.style.pointerEvents = "none";
	this.icon.style.width = "15px";
	this.icon.style.height = "15px";
	this.icon.style.left = "25px";
	this.icon.style.top = "3px";
	this.element.appendChild(this.icon);

	//Text
	this.label = document.createElement("span");
	this.label.style.overflow = "hidden";
	this.label.style.position = "absolute";
	this.label.style.pointerEvents = "none";
	this.label.style.whiteSpace = "nowrap";
	this.label.style.top = "4px";
	this.element.appendChild(this.label);

	var self = this;

	this.arrow.onmouseenter = function()
	{
		this.style.opacity = 1.0;
	};

	this.arrow.onmouseleave = function()
	{
		this.style.opacity = 0.5;
	};

	this.arrow.onclick = function()
	{
		self.folded = !self.folded;
		self.updateFoldedState();
	};

	//Mouse enter
	this.element.onmouseenter = function()
	{
		this.style.backgroundColor = Editor.theme.buttonOverColor;
	};

	//Mouse leave
	this.element.onmouseleave = function()
	{
		if(!Editor.isObjectSelected(self.obj))
		{
			this.style.backgroundColor = Editor.theme.buttonLightColor;
		}
	};

	//Drag state
	var state = 0;

	//Clear element border
	function clearBorder()
	{
		self.element.style.border = "";
		self.element.style.borderTop = "";
		self.element.style.borderBottom = "";
	};

	//Drag start
	this.element.ondragstart = function(event)
	{
		event.dataTransfer.setData("uuid", self.obj.uuid);
		DragBuffer.pushDragElement(self.obj);
	};

	//Drag end
	this.element.ondragend = function(event)
	{
		clearBorder();
		event.preventDefault();

		//Try to remove event from buffer
		var uuid = event.dataTransfer.getData("uuid");
		var obj = DragBuffer.popDragElement(uuid);
	};

	//Drag over
	this.element.ondragover = function(event)
	{
		event.preventDefault();

		//Above
		if(event.layerY < 5)
		{
			if(state !== 1)
			{
				state = 1;
				clearBorder();
				this.style.borderTop = "thin solid #999999";
			}
		}
		//Bellow
		else if(event.layerY > 15)
		{
			if(state !== 2)
			{
				state = 2;
				clearBorder();
				this.style.borderBottom = "thin solid #999999";
			}
		}
		//Inside
		else if(state !== 3)
		{
			state = 3;
			clearBorder();
			this.style.border = "thin solid #999999";
		}
	};

	//Drag leave
	this.element.ondragleave = function()
	{
		event.preventDefault();
		clearBorder();

		state = 0;
	};

	//Context menu
	this.element.oncontextmenu = function(event)
	{
		if(self.obj !== null)
		{
			//Scene and program flags
			var program = self.obj instanceof Program;
			var scene = self.obj instanceof Scene;

			//Context menu
			var context = new ContextMenu();
			context.size.set(150, 20);
			context.position.set(event.clientX, event.clientY);
			
			//Open editor
			if(self.obj instanceof Scene)
			{
				context.addOption("Scene editor", openSceneTab);
			}
			else if(self.obj instanceof Program)
			{
				context.addOption("Create scene", function()
				{
					Editor.program.addDefaultScene();
					Editor.updateObjectViews();
				});			
			}
			else if(self.obj instanceof THREE.Object3D)
			{
				context.addOption("Object editor", openSceneTab);

				if(self.obj instanceof Script)
				{
					context.addOption("Script editor", openScriptTab);
				}
				else if(self.obj instanceof ParticleEmitter)
				{
					context.addOption("Particle editor", openParticleTab);
				}
			}

			//Rename
			context.addOption("Rename", function()
			{
				Editor.renameObject(self.obj);
			});

			//Delete
			if(!program)
			{
				context.addOption("Delete", function()
				{
					Editor.deleteObject(self.obj);
				});
			}

			//Mesh specific stuff
			if(self.obj instanceof THREE.Mesh || self.obj instanceof THREE.SkinnedMesh)
			{
				//If mesh has a geometry attached
				if(self.obj.geometry !== undefined)
				{
					//Generate normals for the attached geometry
					context.addOption("Compute normals", function()
					{
						self.obj.geometry.computeVertexNormals();
					});

					//Apply transformation to geometry
					context.addOption("Apply transformation", function()
					{
						self.obj.geometry.applyMatrix(self.obj.matrixWorld);
						self.obj.position.set(0, 0, 0);
						self.obj.scale.set(1, 1, 1);
						self.obj.rotation.set(0, 0, 0);
					});
				}
				
				//Add physics object
				var physics = context.addMenu("Add physics");

				physics.addOption("Box", function()
				{
					var physics = new PhysicsObject();
					physics.addShape(Mesh2shape.createShape(self.obj, Mesh2shape.Type.BOX));
					physics.name = self.obj.name;
					
					Editor.addToScene(physics);
					Editor.updateObjectViews();
				});

				physics.addOption("Sphere", function()
				{
					var physics = new PhysicsObject();
					physics.addShape(Mesh2shape.createShape(self.obj, Mesh2shape.Type.SPHERE));
					physics.name = self.obj.name;
					
					Editor.addToScene(physics);
					Editor.updateObjectViews();
				});

				physics.addOption("ConvexHull", function()
				{
					var physics = new PhysicsObject();
					physics.addShape(Mesh2shape.createShape(self.obj, Mesh2shape.Type.HULL));
					physics.name = self.obj.name;
					
					Editor.addToScene(physics);
					Editor.updateObjectViews();
				});

				physics.addOption("Cylinder", function()
				{
					var physics = new PhysicsObject();
					physics.addShape(Mesh2shape.createShape(self.obj, Mesh2shape.Type.CYLINDER));
					physics.name = self.obj.name;
					
					Editor.addToScene(physics);
					Editor.updateObjectViews();
				});
			}

			if(!scene && !program)
			{
				var autoUpdate = context.addMenu("Static");

				//Set object and children to static mode
				autoUpdate.addOption("Static", function()
				{
					ObjectUtils.setMatrixAutoUpdate(self.obj, false);
					Editor.updateObjectViews();
				});

				//Set object and children to dynamic mode
				autoUpdate.addOption("Dynamic", function()
				{
					ObjectUtils.setMatrixAutoUpdate(self.obj, true);
					Editor.updateObjectViews();
				});


				var shadow = context.addMenu("Shadows");

				//Set object and children shadow casting mode
				shadow.addOption("Enable", function()
				{
					ObjectUtils.setShadowCasting(self.obj, true);
					ObjectUtils.setShadowReceiving(self.obj, true);

					Editor.updateObjectViews();
				});

				//Set object and children shadow casting mode
				shadow.addOption("Disable", function()
				{
					ObjectUtils.setShadowCasting(self.obj, false);
					ObjectUtils.setShadowReceiving(self.obj, false);

					Editor.updateObjectViews();
				});

				//Duplicate object
				context.addOption("Duplicate", function()
				{
					var obj = new ObjectLoader().parse(self.obj.toJSON());
					obj.traverse(function(child)
					{
						child.uuid = THREE.Math.generateUUID();
					});

					Editor.history.add(new ObjectAddedAction(obj, self.obj.parent));
					Interface.treeView.updateView();
				});

				//Copy object
				context.addOption("Copy", function()
				{
					Editor.copyObject(self.obj);
				});

				//Cut object
				context.addOption("Cut", function()
				{
					Editor.cutObject(self.obj);
					Editor.history.add(new ObjectRemovedAction(self.obj));
				});
			}
			
			if(!program)
			{
				//Paste object form clipboard
				context.addOption("Paste", function()
				{
					Editor.pasteObject(self.obj);
				});
			}

			context.updateInterface();
		}
	};

	//Drop event (fired on the drop target)
	this.element.ondrop = function(event)
	{
		event.preventDefault();
		clearBorder();

		//Collect element from buffer
		var uuid = event.dataTransfer.getData("uuid");
		var obj = DragBuffer.popDragElement(uuid);

		if(obj instanceof THREE.Object3D && obj !== self.obj && !ObjectUtils.isChildOf(obj ,self.obj))
		{
			//Above
			if(event.layerY < 5)
			{
				var index = self.obj.parent.children.indexOf(self.obj);
				Editor.history.add(new ObjectMovedAction(obj, self.obj.parent, index));
			}
			//Bellow
			else if(event.layerY > 15)
			{
				var index = self.obj.parent.children.indexOf(self.obj) + 1;
				Editor.history.add(new ObjectMovedAction(obj, self.obj.parent, index));
			}
			//Inside
			else
			{	
				Editor.history.add(new ObjectMovedAction(obj, self.obj));
			}

			self.container.updateView();
		}
	};

	//Click
	this.element.onclick = function(event)
	{
		if(event.ctrlKey)
		{
			if(Editor.isObjectSelected(self.obj))
			{
				Editor.removeFromSelection(self.obj);
			}
			else
			{
				Editor.addToSelection(self.obj);
			}
		}
		else
		{
			Editor.selectObject(self.obj);
		}
	};

	//Double click
	this.element.ondblclick = function()
	{
		if(self.obj instanceof Script)
		{
			openTab(ScriptEditor, self.obj);
		}
		else if(self.obj instanceof Scene)
		{
			openTab(SceneEditor, self.obj);
		}
		else if(self.obj instanceof ParticleEmitter)
		{
			openTab(ParticleEditor, self.obj);
		}
		else if(self.obj instanceof THREE.Camera)
		{
			openTab(CameraEditor, self.obj);
		}
	};

	function openTab(Constructor, object)
	{
		var tab = Interface.tab.getTab(Constructor, object);
		if(tab === null)
		{
			tab = Interface.tab.addTab(Constructor, true);
			tab.attach(self.obj);
		}
		tab.select();
	}

	function openSceneTab()
	{
		openTab(SceneEditor, self.obj);
	}
	function openScriptTab()
	{
		openTab(ScriptEditor, self.obj);
	}
	function openParticleTab()
	{
		openTab(ParticleEditor, self.obj);
	}
}

TreeElement.prototype = Object.create(Element.prototype);

//Set object attached to element
TreeElement.prototype.attach = function(obj)
{
	this.obj = obj;
	this.uuid = obj.uuid;
	this.folded = obj.folded;

	this.icon.src = ObjectIcons.get(obj.type);
	this.label.innerHTML = obj.name;
	
	if(Editor.isObjectSelected(obj))
	{
		this.element.style.backgroundColor = Editor.theme.buttonOverColor;
	}

	if(this.folded)
	{
		this.arrow.src = Editor.filePath + "icons/misc/arrow_right.png";
	}
};

//Add tree element from object
TreeElement.prototype.addObject = function(obj)
{
	var element = new TreeElement(this.container);
	element.attach(obj);
	element.parent = this;
	this.children.push(element);
	return element;
};

//Add tree element from object
TreeElement.prototype.insertObject = function(obj, index)
{
	var element = new TreeElement(this.container);
	element.attach(obj);
	element.parent = this;
	this.children.splice(index, 0, element);
	return element;
};

//Remove element
TreeElement.prototype.removeElementIndex = function(index)
{	
	var element = this.children[index];
	this.children.splice(index, 1);
	return element;
};

//Add tree element from object
TreeElement.prototype.insertElementIndex = function(element, index)
{
	element.parent = this;
	this.children.splice(index, 0, element);
	return element;
};


//Remove element
TreeElement.prototype.destroy = function()
{
	if(this.container.element.contains(this.element))
	{
		this.container.element.removeChild(this.element);
	}
	
	for(var i = 0; i < this.children.length; i++)
	{
		this.children[i].destroy();
	}
};

//Update folded state for this tree element
TreeElement.prototype.updateFoldedState = function()
{
	this.obj.folded = this.folded;

	if(this.folded)
	{
		this.arrow.src = Editor.filePath + "icons/misc/arrow_right.png";
	}
	else
	{
		this.arrow.src = Editor.filePath + "icons/misc/arrow_down.png";
	}

	this.container.updateChildPosition();
};

//Set element visibility
TreeElement.prototype.setVisibility = function(visible)
{
	this.visible = visible;
	this.element.style.display = this.visible ? "block" : "none";
};

//Update interface
TreeElement.prototype.updateInterface = function()
{
	if(this.visible)
	{
		this.element.style.display = "block";
		this.element.style.top = this.position.y + "px";
	
		var offset = this.level * 20;

		//Arrow
		if(this.obj.isEmpty())
		{
			this.arrow.style.display = "none";
		}
		else
		{
			this.arrow.style.display = "block";
			this.arrow.style.left = (5 + offset) + "px";
		}

		this.icon.style.left = (25 + offset) + "px";
		this.label.style.left = (45 + offset) + "px";

		//Update childs
		for(var i = 0; i < this.children.length; i++)
		{
			this.children[i].updateInterface();
		}
	}
	else
	{
		this.element.style.display = "none";
	}
};
