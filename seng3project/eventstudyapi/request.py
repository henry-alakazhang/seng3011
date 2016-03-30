'''
Created on 30 Mar 2016

@author: Damon
'''

class Request:
    #Initialise object
    def __init__(self,upperWindow,lowerWindow,optVar,Data):
        self.upperWindow = upperWindow
        self.lowerWindow = lowerWindow
        self.Data = Data
        self.processVar(optVar)
        
    #Process all optional parameters    
    def processVar(self,optVar):
        for params in optVar:
            if (self.Data.isExistingVariable(params.getVar())):
                self.optVarNames.append(params.getVar())
                self.optVar[params.getVar()] = OptVar(params.getMin().params.getMax())
            else:
                raise Exception('Invalid Variable ' + params.getVar())
    
    #Checks if a given stock characteristic fulfils the request
    def matchesReq(self,stockChar):
        for varData in stockChar.getInfo():
            if varData.getName() in self.optVarNames:
                if self.optVar[varData.getName()].matches(varData.getValue()):
                    return False
        return True
        
class OptVar:
    #Initialise object
    def __init__(self,varMin,varMax):
        self.varMin = varMin
        self.varMax = varMax        
    
    #Check if value fulfils object criteria
    def matches(self,value):
        return value >= self.varMin and value <= self.varMax

class Data:
    #Takes the output of the parsers and puts it all into one object
    def processFiles(self,F1,F2):
        self.RIC = F1.getRICs()
        self.PriceInfo = F1.getPriceInfo()
        self.Variables = F2.getVars()
        self.CharInfo = F2.getCharInfo()
        self.calcCumRet()
        
    #Calculate the cumulative return for all data
    def calcCumRet(self):
        for RIC in self.RIC:
            stockPriceInfo = self.PriceInfo.getInfo(RIC)
            prevCumRet = 0
            prevPrice = stockPriceInfo.getFirstPrice()
            for priceData in stockPriceInfo:
                currCumRet = prevCumRet + priceData.getPrice() - prevPrice
                self.CumRet[RIC][priceData.getDate()] = currCumRet
                prevCumRet = currCumRet
                prevPrice = priceData.getPrice()            
        
    #Check if a given variable was in File2
    def isExistingVariable(self,var):
        if var in self.Variables:
            return True
        else:
            return False
        
    #Gets the cumulative return for a stock at a given date
    def getCumRet(self,stockName,eventDate):
        return self.cumRet[stockName][eventDate]