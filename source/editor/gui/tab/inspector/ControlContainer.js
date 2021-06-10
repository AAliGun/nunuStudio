import {Locale} from "../../../locale/LocaleManager.js";
import {Video} from "../../../../core/resources/Video.js";
import {Program} from "../../../../core/objects/Program.js";
import {Global} from "../../../Global.js";
import {Text} from "../../../components/Text.js";
import {TabComponent} from "../../../components/tabs/TabComponent.js";
import {SliderTabComponent} from "../../../components/tabs/SliderTabComponent";

/**
 * Inspector container is used to display object inspector panels.
 *
 * It is responsible for selection the appropiate panel for the type of object selected.
 *
 * @class ControlContainer
 * @extends {TabComponent}
 */
function ControlContainer(parent, closeable, container, index)
{
	SliderTabComponent.call(this, parent, closeable, container, index, "slider", Global.FILE_PATH + "icons/misc/magnifier.png");
	/**
	 * Text shown when there is no object select to show on the inspector.
	 *
	 * @attribute emptyText
	 * @type {Text}
	 */
	this.emptyText = new Text(this);
	this.emptyText.allowWordBreak(true);
	this.emptyText.setTextSize(12);
	this.emptyText.setTextColor("NO VIDEO");
	this.emptyText.setText("");


	this.panel = null;
}

ControlContainer.prototype = Object.create(SliderTabComponent.prototype);

ControlContainer.prototype.destroyInspector = function()
{
	if (this.panel !== null)
	{
		this.panel.destroy();
		this.panel = null;
	}

	this.emptyText.setVisibility(true);
};

ControlContainer.prototype.attach = function(object)
{
	if (this.panel !== null)
	{
		this.panel.attach(object);
		this.panel.updateInspector();
	}
};

ControlContainer.prototype.isAttached = function(object)
{
	if (this.panel !== null)
	{
		return this.panel.object === object;
	}

	return false;
};

ControlContainer.prototype.updateObjectsView = function()
{
	if (this.panel !== null)
	{
		var object = this.panel.object;

		if (object.isObject3D === true && object.parent === null)
		{
			if (!(object instanceof Program))
			{
				this.destroyInspector();
			}
		}
	}
};


ControlContainer.prototype.updateSize = function()
{
	SliderTabComponent.prototype.updateSize.call(this);

	this.emptyText.position.x = this.size.x * 0.1;
	this.emptyText.size.set(this.size.x * 0.8, this.size.y);
	this.emptyText.updateInterface();

	if (this.panel !== null)
	{
		this.panel.size.copy(this.size);
		this.panel.updateInterface();
	}
};

export {ControlContainer};
