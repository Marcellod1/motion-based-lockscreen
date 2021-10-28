$(document).ready(function(){
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    const URL = "https://teachablemachine.withgoogle.com/models/298awwFKg/";

    let model, webcam, labelContainer, maxPredictions;

    // Load the image model and setup the webcam
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }

    // Simple submit button event - recognize user input and get a new user prompt
    $("#submit-button").mousedown(function(e){
            $("#submit-button").css("transform", "scale(0.85)");   
    });

    // Mouse up event handler for the submit button - resets the image to normal scale
    $("#submit-button").mouseup(function(e){
            $("#submit-button").css("transform", "scale(1.0)");
            init();
    });


    // Play the unlock animation, lock animation and reset the state
    function unlockPhone(){
        console.log("unlocking...");
        $("#phone-lock-screen").css("z-index", "1");
        $("#phone-border").css("z-index", "2");

        // Queue up animations
        $("#phone-lock-screen").animate({bottom: '+=500px'}, "easeOutCirc");
        $("#phone-lock-screen").animate({bottom: '-=500px'}, "easeOutCirc");

        // Wait for animations to complete then reset the state
        $("#phone-lock-screen").promise().done(function(){
            $("#phone-lock-screen").css("z-index", "2");
            $("#phone-border").css("z-index", "1");
        });
    }
});