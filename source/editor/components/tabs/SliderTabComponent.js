import {Math} from "three";
import {EventManager} from "../../../core/utils/EventManager.js";
import {Component} from "../Component.js";
import {TabGroup} from "./TabGroup.js";
import {TabButton} from "./TabButton.js";
import {TabContainer} from "./splittable/TabContainer.js";
/**
 * Slider element is used to select a numeric value using a visual slider bar.
 *
 * @class SliderTabComponent
 * @extends {Component}
 * @param {Component} parent Parent element.
 * @param closeable
 * @param container
 * @param index
 * @param title
 * @param icon
 */
function SliderTabComponent(parent, closeable, container, index, title, icon)
{
	Component.call(this, parent, "div");

	this.element.style.overflow = "visible";

	var self = this;
	console.log(self);
	// Text
	this.text = document.createElement("div");
	this.text.style.position = "absolute";
	this.text.style.display = "none";
	this.text.style.justifyContent = "center";
	this.text.style.alignItems = "center";
	this.text.style.zIndex = "10000";
	this.text.style.border = "3px solid";
	this.text.style.borderRadius = "5px";
	this.text.style.color = "var(--color-light)";
	this.text.style.backgroundColor = "var(--bar-color)";
	this.text.style.borderColor = "var(--bar-color)";
	document.body.appendChild(this.text);

	// Text value
	this.textValue = document.createTextNode("");
	this.text.appendChild(this.textValue);

	// Mouse mouse move event
	this.element.onmousemove = function(event)
	{
		self.text.style.display = "flex";
		self.text.style.width = "fit-content";
		self.text.style.height = "fit-content";
		self.text.style.left = event.clientX + "px";
		self.text.style.top = event.clientY - 30 + "px";
	};

	// Mouse out event
	this.element.onmouseout = function()
	{
		self.text.style.display = "none";
	};

	// Track
	this.track = document.createElement("div");
	this.track.style.position = "absolute";
	this.track.style.backgroundColor = "var(--bar-color)";
	this.track.style.cursor = "pointer";
	this.track.style.left = "0px";
	this.track.style.width = "100%";
	this.track.style.top = "25%";
	this.track.style.height = "50%";
	this.element.appendChild(this.track);

	// Progress
	this.progress = document.createElement("div");
	this.progress.style.pointerEvents = "none";
	this.progress.style.position = "absolute";
	this.progress.style.backgroundColor = "var(--button-over-color)";
	this.progress.style.height = "100%";
	this.track.appendChild(this.progress);

	// Scrubber
	this.scrubber = document.createElement("div");
	this.scrubber.style.position = "absolute";
	this.scrubber.style.backgroundColor = "var(--color-light)";
	this.scrubber.style.cursor = "pointer";
	this.scrubber.style.height = "160%";
	this.scrubber.style.top = "-25%";
	this.scrubber.style.width = "6px";
	this.track.appendChild(this.scrubber);

	/**
	 * Value stored in the slider.
	 *
	 * @property value
	 * @type {number}
	 */
	this.value = 0.0;

	/**
	 * On change callback function.
	 *
	 * @property onChange
	 * @type {Function}
	 */
	this.onChange = null;

	// Range
	this.min = 1.0;
	this.max = 2.0;
	this.step = null;

	// Drag control
	this.mouseStart = 0;
	this.valueStart = 0;

	/**
	 * Event manager to handle window events.
	 *
	 * @property manager
	 * @type {EventManager}
	 */
	this.manager = new EventManager();
	this.manager.add(window, "mousemove", function(event)
	{
		var delta = (event.pageX - self.mouseStart) / self.size.x;
		var value = self.valueStart + delta * (self.max - self.min);
		self.setValue(value);

		if (self.onChange !== null)
		{
			self.onChange(self.value);
		}
	});

	this.manager.add(window, "mouseup", function()
	{
		self.manager.destroy();
	});

	this.scrubber.onmousedown = function(event)
	{
		self.mouseStart = event.pageX;
		self.valueStart = self.value;
		self.manager.create();
		event.stopPropagation();
	};

	this.track.onmousedown = function(event)
	{
		var percentage = event.layerX / self.size.x;

		self.setValue(percentage * (self.max - self.min) + self.min);
		self.progress.style.width = percentage * 100 + "%";
		self.scrubber.style.left = self.progress.style.width;
		self.scrubber.onmousedown(event);

		if (self.onChange !== null)
		{
			self.onChange(self.value);
		}
	};

	this.preventDragEvents();

	/**
	 * Pointer to the group where this tab is.
	 *
	 * @property container
	 * @type {TabGroup}
	 */
	this.container = container;

	/**
	 * UUID of this tab.
	 *
	 * @property uuid
	 * @type {string}
	 */
	this.uuid = Math.generateUUID();

	/**
	 * Index of the tab inside of the container
	 *
	 * @property index
	 * @type {number}
	 */
	this.index = index;

	/**
	 * Pointer to the button associated with this tab.
	 *
	 * @property container
	 * @type {TabButton}
	 */
	this.button = null;

	// Meta
	this.closeable = closeable;
	this.title = title;
	this.icon = icon;

	/**
	 * Indicates if the tab is currently active (on display).
	 *
	 * @property active
	 * @type {boolean}
	 */
	this.active = false;
}

SliderTabComponent.prototype = Object.create(Component.prototype);

/**
 * Set if element is disabled.
 *
 * @method setDisabled
 * @param {boolean} value.
 */
SliderTabComponent.prototype.setDisabled = function()
{
	// TODO
};

// Set slider min step
SliderTabComponent.prototype.setStep = function(step)
{
	this.step = step;
};

/**
 * Set value range of the slider.
 *
 * @method setRange.
 * @param {number} min
 * @param {number} max
 */
SliderTabComponent.prototype.setRange = function(min, max)
{
	this.min = min;
	this.max = max;
};

/**
 * Set onchange callback.
 *
 * @method setOnChange
 * @param {Function} onChange
 * @param {string} name Graph name.
 */
SliderTabComponent.prototype.setOnChange = function(onChange)
{
	this.onChange = onChange;
};

/**
 * Set Slider value.
 *
 * @method setValue
 * @param {number} value
 */
SliderTabComponent.prototype.setValue = function(value)
{
	if (value < this.min)
	{
		value = this.min;
	}
	else if (value > this.max)
	{
		value = this.max;
	}

	if (this.step !== null)
	{
		var remainder = value % this.step;

		value -= remainder;
		if (remainder > this.step / 2)
		{
			value += this.step;
		}

		// Check for precision problems
		var stepVal = String(this.step).split(".");
		if (stepVal.length > 1)
		{
			var precision = stepVal[1].length;
			var values = String(value).split(".");
			if (values.length > 1)
			{
				value = Number.parseFloat(values[0] + "." + values[1].substr(0, precision));
			}
		}
	}

	this.value = value;
	this.updateValue();
};

/**
 * Get Slider value.
 *
 * @method getValue
 * @return {number} Value of the slider.
 */
SliderTabComponent.prototype.getValue = function()
{
	return this.value;
};

/**
 * Update the DOM elements to represent the value.
 *
 * @method updateValue
 */
SliderTabComponent.prototype.updateValue = function()
{
	var progress = (this.value - this.min) / (this.max - this.min) * 100;

	this.progress.style.width = progress + "%";
	this.scrubber.style.left = progress + "%";
	this.textValue.data = this.value;
};


/**
 * Update tab metadata (name, icon, ...)
 *
 * Called after applying changes to object.
 *
 * Called for every tab.
 *
 * @method updateMetadata
 */
SliderTabComponent.prototype.updateMetadata = function() {};

/**
 * Update tab settings.
 *
 * Called after settings of the editor are changed.
 *
 * Called for every tab.
 *
 * @method updateSettings
 */
SliderTabComponent.prototype.updateSettings = function() {};

/**
 * Update tab values of the gui for the object attached.
 *
 * Called when properties of objects are changed.
 *
 * Called only for active tabs.
 *
 * @method updateValues
 */
SliderTabComponent.prototype.updateValues = function() {};

/**
 * Update tab object view.
 *
 * Called when objects are added, removed, etc.
 *
 * Called only for active tabs.
 *
 * @method updateObjectsView
 */
SliderTabComponent.prototype.updateObjectsView = function() {};

/**
 * Update tab after object selection changed.
 *
 * Called after a new object was selected.
 *
 * Called only for active tabs.
 *
 * @method updateSelection
 */
SliderTabComponent.prototype.updateSelection = function() {};

/**
 * Activate tab.
 *
 * Called when a tab becomes active (visible).
 *
 * @method activate
 */
SliderTabComponent.prototype.activate = function()
{
	if (this.active === true)
	{
		this.deactivate();
	}

	// TODO <IF TAB NEEDS UPDATE IT SHOULD TAKE CARE OF IT>
	if (this.update !== undefined)
	{
		var self = this;

		var update = function()
		{
			self.update();

			if (self.active === true)
			{
				requestAnimationFrame(update);
			}
		};

		requestAnimationFrame(update);
	}

	this.active = true;
};

/**
 * Deactivate tab.
 *
 * Called when a tab is deactivated or closed.
 *
 * @method deactivate
 */
SliderTabComponent.prototype.deactivate = function()
{
	this.active = false;
};

/**
 * Generic method to attach object to a tab.
 *
 * Attached object can be edited using the tab.
 *
 * @method attach
 * @param {Object} object
 */
SliderTabComponent.prototype.attach = function() {};

/**
 * Check if an object or resource is attached to the tab.
 *
 * Called to check if a tab needs to be closed after changes to objects.
 *
 * @method isAttached
 */
SliderTabComponent.prototype.isAttached = function()
{
	return false;
};

/**
 * Close the tab element and remove is from the container.
 *
 * @method close
 */
SliderTabComponent.prototype.close = function()
{
	this.container.removeTab(this);
};

/**
 * Select this tab.
 *
 * @method select
 */
SliderTabComponent.prototype.select = function()
{
	this.container.selectTab(this);
};

/**
 * Check if tab is selected
 *
 * @method isSelected
 * @return {boolean} True if the tab is selected in the container.
 */
SliderTabComponent.prototype.isSelected = function()
{
	return this === this.container.selected;
};

/**
 * Set icon of the button attached to this tab.
 *
 * The button should have a .setIcon(url) method.
 *
 * @method setIcon
 * @param {string} icon URL of the icon.
 */
SliderTabComponent.prototype.setIcon = function(icon)
{
	this.icon = icon;
	this.button.setIcon(icon);
};

/**
 * Set text in the button.
 *
 * The button should have a .setName(text) method.
 *
 * @method setName
 * @param {string} text
 */
SliderTabComponent.prototype.setName = function(text)
{
	this.title = text;
	this.button.setName(text);
};

SliderTabComponent.prototype.destroy = function()
{
	Component.prototype.destroy.call(this);

	if (this.button !== null)
	{
		this.button.destroy();
	}
};

export {SliderTabComponent};
