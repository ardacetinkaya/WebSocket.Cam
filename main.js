(function () {
    var signalObj = null;

    window.addEventListener('DOMContentLoaded', function () {
        var isStreaming = false;
        var start = document.getElementById('start');
        var stop = document.getElementById('stop');
        var video = document.getElementById('v');
        var canvas = document.getElementById('c');
        var ctx = canvas.getContext('2d');

        var photo = document.getElementById('p');
        var ptx = canvas.getContext('2d');

        var effect = document.getElementById('effect');
        var takephoto = document.getElementById("take");
        var isEffectActive = false;
        var canTakePhoto = false;

        start.addEventListener('click', function (e) {
            var address = document.getElementById('address').value;
            var protocol = location.protocol === "https:" ? "wss:" : "ws:";
            var wsurl = protocol + '//' + address;

            if (!isStreaming) {
                signalObj = new signal(wsurl,
                    function (stream) {
                        console.log('got a stream!');
                        video.srcObject = stream;
                        video.play();
                    },
                    function (error) {
                        alert(error);
                    },
                    function () {
                        console.log('websocket closed. bye bye!');
                        video.srcObject = null;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        isStreaming = false;
                    },
                    function (message) {
                        alert(message);
                    }
                );
            }
        }, false);

        stop.addEventListener('click', function (e) {
            if (signalObj) {
                signalObj.hangup();
                signalObj = null;
            }
        }, false);

        // Wait until the video stream can play
        video.addEventListener('canplay', function (e) {
            if (!isStreaming) {
                canvas.setAttribute('width', video.videoWidth);
                canvas.setAttribute('height', video.videoHeight);
                isStreaming = true;
            }
        }, false);

        // Wait for the video to start to play
        video.addEventListener('play', function () {
            // Every 33 milliseconds copy the video image to the canvas
            setInterval(function () {
                if (video.paused || video.ended) {
                    return;
                }
                var w = canvas.getAttribute('width');
                var h = canvas.getAttribute('height');
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(video, 0, 0, w, h);
                if (isEffectActive) {
                    detectFace(canvas);
                }
                if (canTakePhoto) {
                    var link = document.getElementById('link');
                    link.setAttribute('download', 'photo.png');
                    link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
                    link.click();
                    console.log(canvas.toDataURL("image/png"));
                    canTakePhoto=false;
                }
            }, 33);
        }, false);

        effect.addEventListener('click', function () {
            isEffectActive = !isEffectActive;
        }, false);

        takephoto.addEventListener('click', function () {
            canTakePhoto = !canTakePhoto;
        }, false);
    });
})();