/* draw a node and its children
* if measure == true: don't draw, just measure bounding box
* returns [width, height, label_position_x]
*/
function draw_node(node, context, measure) {
    var margin = 10;
    var spaceing = 20;
    if(typeof(node[1]) == typeof("")) {
	    var width1 = context.measureText(node[0]).width;
	    var width2 = context.measureText(node[1]).width;
        var max = width1 > width2 ? width1 : width2;
        var height = parseInt(context.font);
        if(measure != true) {
            context.textBaseline = "top";
            context.textAlign = "center";
            context.fillText(node[0], max / 2, 0);
            context.fillText(node[1], max / 2, height + spaceing);
            context.beginPath();
            context.moveTo((max / 2) | 0, height + 2);
            context.lineTo((max / 2) | 0, height + spaceing - 2);
            context.stroke();
        }
        return [max, height * 2 + spaceing + 2, (max / 2) | 0];
    } else {
        var label_width = context.measureText(node[0]).width;
        var height = parseInt(context.font);
        var children_width = 0;
        var children_height = height;
        var children_center = [];
        context.save();
        context.translate(0, height + spaceing);
        var label_position = 0;
        for(var i = 1; i < node.length; i++) {
            var dimension = draw_node(node[i], context, measure);
            context.translate(dimension[0] + margin, 0);
            var child = children_width + dimension[2];
            children_width += dimension[0];
            if(i < node.length - 1) children_width += margin;
            if(children_height < height + spaceing + dimension[1]) children_height = height + spaceing + dimension[1];
            children_center.push(child);
            label_position += child;
        }
        label_position = (label_position / children_center.length) | 0;
        context.restore();
        if(measure != true) {
            for(var i = 0; i < children_center.length; i++) {
                context.beginPath();
                context.moveTo(label_position, height + 2);
                context.lineTo(children_center[i], height + spaceing - 2);
                context.stroke();
            }
            context.textBaseline = "top";
            context.textAlign = "center";
            context.fillText(node[0], label_position, 0);
            //context.strokeRect(0, 0, children_width, children_height);
        }
        return [children_width, children_height, label_position];
    }
}

/* convert the s-expression to arrays, then draw the tree */
function draw_parse_tree(name, input) {
    try {
      
        var tree = JSON.parse(input.replace(/^\( /, "")
            .replace(/\n/, "")
            .replace(/ \)$/, "")
            .replace(/\) ?\(/g, "],[")
            .replace(/ /g, ",")
            .replace(/\(/g,"[")
            .replace(/\)/g, ']')
            .replace(/([^\[\]:,]+)/g, '"$1"'));

        var target = document.getElementById(name);
        var context = target.getContext('2d');
        context.font = "14px Serif"; // set font to get the right size

        var dimension = draw_node(tree, context, true);
        console.log(dimension);
        target.width = dimension[0];
        target.height = dimension[1];

        context.fillStyle = "black";
        context.strokeStyle = "red";
        context.font = "14px Serif"; // font was lost when resizing

        console.log(draw_node(tree, context, false));
    } catch (e) {
        // there was an error, display a message accordingly
    }
}
