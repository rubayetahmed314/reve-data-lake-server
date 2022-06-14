# import the necessary packages
import pytesseract
import io
import sys
import argparse
import cv2
import base64
import numpy as np
from PIL import Image

# pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

# # construct the argument parser and parse the arguments}
# ap = argparse.ArgumentParser()
# ap.add_argument("-i", "--image", required=True,
# 	help="path to input image to be OCR'd")
# args = vars(ap.parse_args())

# print("Spawned")

# Take in base64 string and return PIL image
def stringToImage(base64_string):
    imgdata = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(imgdata))


# load the input image and convert it from BGR to RGB channel
# ordering}
# image = cv2.imread(args["image"])
image = cv2.imread(sys.argv[1])
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
# use Tesseract to OCR the image
text = pytesseract.image_to_string(image, lang='ben',
                                   config=f'--psm {int(sys.argv[2])} --oem 1')

with open("ocr.txt", "w", encoding="utf-8") as f:
    f.write(text)
# print(text)
# sys.stdout.flush()
