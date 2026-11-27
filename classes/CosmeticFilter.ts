export class CosmeticFilter {
    private filterList: string[];
    private filterVersion: string;
    //private positionScore: Number;
    //private accessTime: Number;


    public constructor(filterList:Array<string>, filterVersion:string) {
        this.filterList = filterList
        this.filterVersion = filterVersion
    }

    private async fetchFilter():Promise<string>{
        const fnbList = 'https://secure.fanboy.co.nz/fanboy-annoyance.txt'

        try {
            const response = await fetch(fnbList);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            console.log(response)
            return await response.text();
        } catch (error:any) {
            console.error(`Failed to fetch ${fnbList}:`, error.message);
            throw error;
        }
    }

    public async updateFilter(){        
        let filterData = await this.fetchFilter()
        console.log('999')
        console.log(`Filter: ${filterData}`)

        let nVersion = this.extractVersion(filterData).version
        console.log(`Nova Versão: ${nVersion}`)

        if (nVersion == null){
            return
        }

        if (parseInt(this.filterVersion) < parseInt(nVersion)){
            let nFilterData:string = filterData
            let filterArray:Array<string> = nFilterData.split('\n')
            filterArray.splice(0,15)

            let finalFilterArray: Array<string> = []
            
            for (let i = 0; i < filterArray.length; i++){
                if (
                    !filterArray[i]?.startsWith('!') &&
                    !filterArray[i]?.startsWith('@') &&
                    !filterArray[i]?.includes('#?#') &&
                    !filterArray[i]?.includes('#@#') &&
                    !filterArray[i]?.includes('~') &&
                    !filterArray[i]?.includes('$') &&
                    !filterArray[i]?.includes('{') &&
                    !filterArray[i]?.includes('[') &&
                    filterArray[i]?.includes('##') &&
                    !((filterArray[i]?.length ?? 0) < 5)    
                ){
                    finalFilterArray.push(filterArray[i]!)
                }
            }
                //console.log(`Itens separados ao filtro: ${filterArray.length}`)
                console.log(`Itens separados ao filtro: ${finalFilterArray.length}`)

            //this.filterList = filterArray
            this.filterList = finalFilterArray
            this.filterVersion = nVersion || '0'

            browser.storage.local.set({
                filterList: finalFilterArray,
                filterVersion: nVersion,
            }, () => { });
        }
    }

    public async forceUpdateFilter(){
        let filterData = await this.fetchFilter()
        console.log(`Filter: ${filterData}`)


        let nVersion = this.extractVersion(filterData).version
        console.log(`Nova Versão: ${nVersion}`)


        let nFilterData: string = filterData
        let filterArray: Array<string> = nFilterData.split('\n')
        filterArray.splice(0, 15)

        let finalFilterArray: Array<string> = []

        for (let i = 0; i < filterArray.length; i++) {
            if (
                !filterArray[i]?.startsWith('!') &&
                !filterArray[i]?.startsWith('@') &&
                !filterArray[i]?.includes('#?#') &&
                !filterArray[i]?.includes('#@#') &&
                !filterArray[i]?.includes('~') &&
                !filterArray[i]?.includes('$') &&
                !filterArray[i]?.includes('{') &&
                !filterArray[i]?.includes('[') &&
                filterArray[i]?.includes('##') &&
                !((filterArray[i]?.length ??0) < 5)
            ) {
                finalFilterArray.push(filterArray[i]!)
            }
        }

        console.log(`Itens separados ao filtro: ${finalFilterArray.length}`)

        this.filterList = finalFilterArray
        this.filterVersion = nVersion || '0'

        browser.storage.local.set({
            filterList: finalFilterArray,
            filterVersion: nVersion,
        }, () => { });
    }

    private extractVersion(content:string) {
        const versionMatch = content.match(/^! Version: (.+)$/m);
        const lastModifiedMatch = content.match(/^! Last modified: (.+)$/m);

        return {
            version: versionMatch ? versionMatch[1] : null,
            lastModified: lastModifiedMatch ? lastModifiedMatch[1] : null
        };
    }

    public getFilterList():Array<string>{
        return this.filterList
    }

    public getFilterVersion(): string {
        return this.filterVersion
    }


    //
    public parseFilter(abpFilter:string, hostUrl:URL){
        const separatorChar = ','
        const hostname = hostUrl.hostname

        //COSMETIC
        //class
        if (abpFilter.includes('##.')){
            if (abpFilter.startsWith('##.')) {
                return {
                    toBlock: true,
                    blockType: 'elem-hide',
                    blockSubtype: 'class',
                    blockContent: abpFilter.slice(3),
                }
            } else {
                const filterParts = abpFilter.split('##.')
                const filterHostnames = filterParts[0]?.split(',')
                for (var it in filterHostnames){
                    if (it.startsWith('||')){
                        if (hostname.includes(it)){
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'class',
                                blockContent: filterParts[1],
                            }
                        }
                    } else if (it.endsWith('|')) {
                        if (hostname == it.substring(0,it.length-1)) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'class',
                                blockContent: filterParts[1],
                            }
                        }
                    } else if(it.startsWith('|')) {
                        if (hostname.startsWith(it.substring(1,it.length))){
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'class',
                                blockContent: filterParts[1],
                            }
                        }
                    }
                } 
                
                if (filterHostnames?.includes(hostname)) {
                    return {
                        toBlock: true,
                        blockType: 'elem-hide',
                        blockSubtype: 'class',
                        blockContent: filterParts[1],
                    }
                }
            }
        //id
        } else if (abpFilter.includes('###')){
            if (abpFilter.startsWith('###')){
                return {
                    toBlock: true,
                    blockType: 'elem-hide',
                    blockSubtype: 'id',
                    blockContent: abpFilter.slice(3),
                }
            } else {
                const filterParts = abpFilter.split('###')
                const filterHostnames = filterParts[0]?.split(',')

                for (var it in filterHostnames) {
                    if (it.startsWith('||')) {
                        if (hostname.includes(it)) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'id',
                                blockContent: filterParts[1],
                            }
                        }
                    } else if (it.endsWith('|')) {
                        if (hostname == it.substring(0, it.length - 1)) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'id',
                                blockContent: filterParts[1],
                            }
                        }
                    } else if (it.startsWith('|')) {
                        if (hostname.startsWith(it.substring(1, it.length))) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'id',
                                blockContent: filterParts[1],
                            }
                        }
                    }
                }

                if (filterHostnames?.includes(hostname)) {
                    return {
                        toBlock: true,
                        blockType: 'elem-hide',
                        blockSubtype: 'id',
                        blockContent: filterParts[1],
                    }
                }
            }

        } else if (abpFilter.includes('##')) {
            if (abpFilter.startsWith('##')) {
                return {
                    toBlock: true,
                    blockType: 'elem-hide',
                    blockSubtype: 'element',
                    blockContent: abpFilter.slice(2),
                }
            } else {
                const filterParts = abpFilter.split('##')
                const filterHostnames = filterParts[0]?.split(',')

                for (var it in filterHostnames) {
                    if (it.startsWith('||')) {
                        if (hostname.includes(it)) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'element',
                                blockContent: filterParts[1],
                            }
                        }
                    } else if (it.endsWith('|')) {
                        if (hostname == it.substring(0, it.length - 1)) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'element',
                                blockContent: filterParts[1],
                            }
                        }
                    } else if (it.startsWith('|')) {
                        if (hostname.startsWith(it.substring(1, it.length))) {
                            return {
                                toBlock: true,
                                blockType: 'elem-hide',
                                blockSubtype: 'element',
                                blockContent: filterParts[1],
                            }
                        }
                    }
                }

                if (filterHostnames?.includes(hostname)) {
                    return {
                        toBlock: true,
                        blockType: 'elem-hide',
                        blockSubtype: 'element',
                        blockContent: filterParts[1],
                    }
                }
            }
        //BLOCk
        } else {
            if (abpFilter.includes(hostname)) {
                return {
                    toBlock: true,
                    blockType: 'request',
                    blockSubtype: 'full',
                    blockContent: null
                }
            }
        }
        return {
            toBlock: false,
            blockType: null,
            blockSubtype: null,
            blockContent: null
        }
        
    }

}


