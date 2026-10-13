"""Print the book text for printed pages:  python3 content/page.py 44   or   python3 content/page.py 44-48
Page images (to check tables, arrows and figures the text extraction loses): dist/pages/pNNN.webp"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
pages = open(os.path.join(HERE, 'book-text.txt'), encoding='utf-8').read().split('\f')
a, _, b = sys.argv[1].partition('-'); a = int(a); b = int(b or a)
for n in range(a, b + 1):
    print(f'\n===== PRINTED PAGE {n} =====\n{pages[n - 1]}')
