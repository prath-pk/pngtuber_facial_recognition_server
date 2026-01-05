
# PNGTuber Facial and Gesture Recognition Emote Server

This repo lets you configure some pre-created static images with some emotes to be shown using facial and gesture recognition. It uses Google's free AI library mediapipe.

## Requirements

* [Node.Js](https://nodejs.org/en/download/current)
    * Install [nodemon](https://www.npmjs.com/package/nodemon) (For easier deployment) globally.
* Python
    * [mediapipe Python Library](https://ai.google.dev/edge/mediapipe/solutions/guide)

## Steps

1. Install the required software mentioned above - (Python and Node.js).
2. Clone the repo.
3. Change the images in [images](/public/images/) folder.
4. Change paths according to images in [server.js](server.js).
5. Change the mappings in [mappings.json](mappings.json) - This file contains the list of images and their corrosponding facial or hand gesture.
6. Create python virtual environment and activate it.
    * <details>
        <summary>Instructions</summary>

        ```
        1. cd path/to/your/project
        2. python -m venv venv or python3 -m venv venv
        2. <path to virtual env\>/Scripts/activate
        ```
    </details>
7. Install requirements.txt.
    ```
    pip install -r requirements.txt
    ```
8. If you're using windows (like me) I've created batch files to run the code directly.
9. If you're using Linux then you can run both python and node scripts in any order but first node server is recommended.
    * <details>
        <summary>Steps</summary>

        ```
        1. nodemon server.js
        2. py main.py
        ```
    </details>