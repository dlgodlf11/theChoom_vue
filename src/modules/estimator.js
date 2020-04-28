import { drawKeypoints, drawSkeleton } from "./util";
async function process(net, callback) {
  const cam_video = document.getElementById("video");
  const cam_result = document.getElementById("output");

  const ref_video = document.getElementById("video2");
  const ref_result = document.getElementById("output2");

  var videoWidth = cam_video.width;
  var videoHeight = cam_video.height;

  cam_result.width = videoWidth;
  cam_result.height = videoHeight;

  ref_result.width = videoWidth;
  ref_result.height = videoHeight;

  async function poseDetectionFrame(canvas, video) {
    // Begin monitoring code for frames per second
    const ctx = canvas.getContext("2d");

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;

    minPoseConfidence = 0.7;
    minPartConfidence = 0.7;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();

    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();
    const pose = await net.estimatePoses(canvas, {
      flipHorizontal: false,
      decodingMethod: "single-person",
    });
    poses = poses.concat(pose);

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    poses.forEach(({ score, keypoints }) => {
      if (score >= minPoseConfidence) {
        drawKeypoints(keypoints, minPartConfidence, ctx);
        drawSkeleton(keypoints, minPartConfidence, ctx);
      }
    });

    // End monitoring code for frames per second
    return poses;
    //requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame(cam_result, cam_video).then(function(pose_user) {
    poseDetectionFrame(ref_result, ref_video).then(function(pose_ref) {
      callback(pose_user, pose_ref);
    });
  });
}
export default process;
