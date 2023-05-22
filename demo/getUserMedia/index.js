(() => {
  // 捕获照片得宽高，将 width 设置为此处定义的值，height 会基于输入的视频流进行计算。
  const width = 320;
  let height = 0;

  // |streaming|表示当前是否正在从摄像机流式传输视频。
  let streaming = false;

  // 我们需要配置或控制的 HTML 元素变量。这些将在 startup（）函数中进行设置。
  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  function startup() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");

    // 提示用户给予使用媒体输入的许可，许可后会 resolve MediaStream 对象。
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          // 兼容 Firefox，如果无法从视频中读取高度，将在此定义 height。
          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    startbutton.addEventListener(
      "click",
      (ev) => {
        takepicture();
        ev.preventDefault();
      },
      false
    );

    clearphoto();
  }

  // 在照片中填充一个由 canvas 生成的默认显示图。
  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // 获取 video 的当前内容并将其绘制到 canvas 中，然后将其转换为PNG格式的 data URL来捕获照片。
  // 先在屏幕外 canvas 上绘制，然后再绘制到屏幕上，这样使我们可以在绘制之前更改其大小等配置。
  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearphoto();
    }
  }

  window.addEventListener("load", startup, false);
})();
