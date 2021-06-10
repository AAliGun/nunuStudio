import {Locale} from "../../../locale/LocaleManager.js";
import {Video} from "../../../../core/resources/Video.js";
import {Program} from "../../../../core/objects/Program.js";
import {Global} from "../../../Global.js";
import {Text} from "../../../components/Text.js";
import {TabComponent} from "../../../components/tabs/TabComponent.js";

/**
 * Inspector container is used to display object inspector panels.
 *
 * It is responsible for selection the appropiate panel for the type of object selected.
 *
 * @class VideoContainer
 * @extends {TabComponent}
 */
function VideoContainer(parent, closeable, container, index)
{
	TabComponent.call(this, parent, closeable, container, index, "Video", Global.FILE_PATH + "icons/misc/magnifier.png");


	if (this.element.canPlayType("video/mp4"))
	{
		this.element.setAttribute("src", "https://media.giphy.com/media/8PsbM0OpqPl9OClfSw/giphy.mp4");
	}
	else
	{
		this.element.setAttribute("src", "C:\\Users\\aagun\\Videos\\Captures\\360AVM _ Artırılmış Sanal Gerçeklik Dünyası - Opera 2021-04-27 12-21-26.ogg");
	}
	/**
	 * Text shown when there is no object select to show on the inspector.
	 *
	 * @attribute emptyText
	 * @type {Text}
	 */
	this.emptyText = new Text(this);
	this.emptyText.allowWordBreak(true);
	this.emptyText.setTextSize(12);
	this.emptyText.setTextColor("NO VİDEO");
	this.emptyText.setText(Locale.nothingToShow);


	this.panel = null;
}

VideoContainer.prototype = Object.create(TabComponent.prototype);

VideoContainer.prototype.destroyInspector = function()
{
	if (this.panel !== null)
	{
		this.panel.destroy();
		this.panel = null;
	}

	this.emptyText.setVisibility(true);
};

VideoContainer.prototype.attach = function(object)
{
	if (this.panel !== null)
	{
		this.panel.attach(object);
		this.panel.updateInspector();
	}
};

VideoContainer.prototype.isAttached = function(object)
{
	if (this.panel !== null)
	{
		return this.panel.object === object;
	}

	return false;
};

VideoContainer.prototype.updateObjectsView = function()
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


VideoContainer.prototype.updateSize = function()
{
	TabComponent.prototype.updateSize.call(this);

	this.emptyText.position.x = this.size.x * 0.1;
	this.emptyText.size.set(this.size.x * 0.8, this.size.y);
	this.emptyText.updateInterface();

	if (this.panel !== null)
	{
		this.panel.size.copy(this.size);
		this.panel.updateInterface();
	}
};

export {VideoContainer};
