''' 
parser.py: contains functions for parsing uploaded CSV files into python data structures
Created on 01 Apr 2016

@author: Henry
'''

import csv

# parses a file into a data structure
class Parser:
    def __init__(self, file):
        # read and format data into a dictionary mapping RICs to arrays of data relevant to that RIC
        #   for prices, RIC -> arr[dict (eg. date, open, close) -> values]
        #   for events, RIC -> arr[dict param -> values]
        heads = []
        self.fileData = {}
        with open(file, newline='') as f:
            reader = csv.reader(f)
            rowNum = 0
            for row in reader:
                if rowNum == 0:
                    self.heads = row
                    rowNum += 1
                else:
                    if not row[0] in self.fileData:
                        self.fileData[row[0]] = []
                    entry = {}
                    for i in range(0, len(self.heads)):
                        entry[self.heads[i]] = row[i]
                    self.fileData[row[0]].append(entry)

    def getRICs(self):
        return list(self.fileData.keys())

    def getVars(self):
        return list(next(iter(self.fileData[next(iter(self.fileData))])).keys())
        
    def getInfo(self, ric):
        return self.fileData[ric]