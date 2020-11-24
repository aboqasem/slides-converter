# slides-converter

#### Convert lecture slide PNG images with text in them to PDF with the text embedded to enable searching and convenient browsing.
#### It's not yet complete nor clean, I've done it rushing just to do the job.

## Base Directory Structure

1. Create the directory and copy its absolute path, example:
    ```shell script
    mkdir "Base Directory"
    ```
2. Create the `.env` file:
    ```shell script
    touch .env
    ```
2. Place the absolute path as `BASE_DIR` in `.env`, copy and customize the variables, check `.env.example` for example.
3. Create a directory inside it with the name of `Lectures for extraction`:
    ```shell script
    cd "Base Directory"
    mkdir "Lectures for extraction"
    ```
4. Create the lecture images directories and name them `Lec01`, `Lec02`, etc.:
    ```shell script
    cd "Lectures for extraction"
    mkdir Lec01 Lec02
    ```
5. Place the **.png** images inside the directories as needed, each image must contain `Screenshot` in its name, example: `Screenshot 1.png`, `Screenshot 2.png`, etc.
6. Create a directory `Lectures` in the base directory:
    ```shell script
    cd ../
    mkdir Lectures
    ```
- Final directory structure in `/User/YourUsername/Path/To/Base Directory`:
    ```
    Lectures/
        [Converted PDFs will be here]
    Lectures for extraction/
        Lec01/
            Screenshot 1.png
            Screenshot 2.png
        Lec02/
            Screenshot 1.png
            Screenshot 2.png
    ```


## Usage

* You must have [node.js](https://nodejs.org/en/) installed.

* Install dependencies:
    ```shell script
    npm i
    ```
* To start after editing the `.env` file:
    ```shell script
    npm start
    ```
