var dojoConfig = {
    locale: "nb-no",
    parseOnLoad: "false",

    baseUrl: "", //Får loaderen til å lete etter moduler relativt til denne stien, derfor må esri og dojo inn i packages, ellers finner ikke loaderen de, den forsøker å hente pakkene fra baseUrl
    async: true,
    tlmSiblingOfDojo: false, //Får loaderen til å lete relativt til baseUrl og ikke relativt til dojo
    
    packages: [        
        { name: "dojo", location: "https://js.arcgis.com/4.11/dojo" },        
        { name: "esri", location: "https://js.arcgis.com/4.11/esri" },
        { name: "moment", location: "https://js.arcgis.com/4.11/moment" },
        

        { name: "js", location: "js" }, //Her ligger alle våre komponenter            
        { name: "app", location: "js", main: "app" }
    ]
};

//when you use parseOnLoad, any functions you have passed to dojo.ready will not get executed 
//until after the parser runs and any widgets it finds have been created and initialized.
