#%%
'''
make a qr code for the lab website and my name card page (https://qlulab.github.io/website/qihonglu.html)
'''

import qrcode

output_dir = 'imgs/'
#%%
# create a qr code for the lab website
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data('https://qlulab.github.io/website/')
qr.make(fit=True)

# save the qr code as a png file
img = qr.make_image(fill_color="black", back_color="white")
img.save(output_dir + 'lab_website_qr.png')

#%%
# create a qr code for the name card page
qr2 = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr2.add_data('https://qlulab.github.io/website/qihonglu.html')
qr2.make(fit=True)

# save the qr code as a png file
img2 = qr2.make_image(fill_color="black", back_color="white")
img2.save(output_dir + 'namecard_qr.png')