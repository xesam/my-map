function MoveMarker(marker) {
    this.marker = marker;
    this.speed = 4000;
    this.fps = 60;
    this.path = [];
    this.point_index = 0;
    this._interval_flag = null;
}

MoveMarker.prototype.moveTo = function (to, running_cbk, finish_cbk) {
    var map = this.marker.getMap();
    var _projection = map.getMapType().getProjection();
    var from = _projection.lngLatToPoint(marker.getPosition());
    this._interval_flag = move_tick(
        from,
        to,
        this.speed,
        this.fps,
        null, 
        function (running, index) {
            var nextPixel = new BMap.Pixel(running.x, running.y);
            var nextPos = _projection.pointToLngLat(nextPixel);
            marker.setPosition(nextPos);
            running_cbk && running_cbk();
        },
        function (running, index) {
            console.log('point-finished');
            var nextPixel = new BMap.Pixel(running.x, running.y);
            var nextPos = _projection.pointToLngLat(nextPixel);
            marker.setPosition(nextPos);
            finish_cbk && finish_cbk();
        });
}

MoveMarker.prototype._moveNext = function () {
    if (this.point_index >= this.path.length) {
        console.log('path-finished');
        return;
    }
    var _this = this;
    var next_point = _this.path[_this.point_index];
    this.moveTo(next_point, null, function () {
        _this.point_index++;
        _this._moveNext();
    });
}

MoveMarker.prototype.start = function () {
    if (this.path.length == 0) {
        console.log('no path');
        return;
    }
    this.point_index = 0;
    this._moveNext();
}

MoveMarker.prototype.reset = function () {
    this.point_index = 0;
    clearInterval(this._interval_flag);
}

MoveMarker.prototype.addPath = function (points) {
    this.path = this.path.concat(points);
}

MoveMarker.prototype.updatePath = function (points, includeCurrent) {
    this.stop();
}

MoveMarker.prototype.stop = function () {
    clearInterval(this._interval_flag);
}

MoveMarker.prototype.pause = function () {
    clearInterval(this._interval_flag);
}

MoveMarker.prototype.resume = function () {
    clearInterval(this._interval_flag);
}

MoveMarker.prototype.restart = function () {
    this.stop();
    this.start();
}

MoveMarker.prototype.pauseForLandmark = function (landmark) {
    
}

MoveMarker.prototype.speed = function (newSpeed) {
    
}

function move_tick(from, to, speed, fps, first_cbk, tick_cbk, last_cbk) {
    var frame_duration = 1000 / fps;
    var delta_x = to.x - from.x;
    var delta_y = to.y - from.y;
    var total_distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
    var seconds = total_distance / speed;
    var actual_frames = seconds * fps;
    var normal_frames = Math.floor(actual_frames);
    var final_frames = Math.ceil(actual_frames);
    var need_fill = final_frames > normal_frames;
    var step_x = delta_x / final_frames;
    var step_y = delta_y / final_frames;

    var frame_index = 0;
    var current_pos = {
        x: from.x,
        y: from.y
    };
    first_cbk && first_cbk(current_pos, frame_index);
    var interval_flag = setInterval(function () {
        if (frame_index >= normal_frames) {
            clearInterval(interval_flag);
            if (need_fill && last_cbk) {
                last_cbk({
                    x: to.x,
                    y: to.y
                }, frame_index);
            }
        }else{
            current_pos.x += step_x;
            current_pos.y += step_y;
            var running = {
                x : current_pos.x,
                y : current_pos.y
            };
            tick_cbk && tick_cbk(running, frame_index);
            frame_index++;
        }
    }, frame_duration);
    return interval_flag;
}
