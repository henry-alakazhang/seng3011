'''
Created on 30 Mar 2016

@author: Damon
'''

#Process request
def process(request):
    charsToProcess = list()
    for stockChar in request.Data.CharInfo:
        if (request.matchesReq(stockChar)):
            charsToProcess.append(stockChar)
    upperWindow = request.getUpperWindow()
    lowerWindow = request.getLowerWindow()
    data = request.getData()
    result = dict()
    for stockChar in charsToProcess:
        result[stockChar] = calcCumRet(stockChar,upperWindow,lowerWindow,data)
        
#Process each individual stock characteristic
def calcCumRet(stockChar,upperWindow,lowerWindow,data):
    cumRet = dict()
    for i in range(lowerWindow,upperWindow):
        cumRet[i] = data.getCumRet(stockChar.getStockName(),stockChar.getDate() + i)
    return cumRet