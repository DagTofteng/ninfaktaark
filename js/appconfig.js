﻿define([

],
    function () {

        //environment kan være "UTV", "TEST", "PROD"
        var environment = "UTV";

        //UTV settings
        var _urlNaturtyper = "https://arcgis03.miljodirektoratet.no/arcgis/rest/services/faktaark/naturtyper_nin/MapServer/";            
        var _indexNaturTypeAlle = 0;
        var _indexRelationshipKartleggingsenhet = 0;
        var _indexRelationshipBeskrivelsesVariabler = 1;
        var _indexRelationshipDekningskart = 2;
        var _agolWebMapID = "a758ae6e84f84b3fba426d14d7cc9d4b";
        var _artsDatabankenKartlegginsenheter = "https://artsdatabanken.no/nin2.0/";
        var _artsDatabankenBeskrivelsesvariabler = "https://artsdatabanken.no/nin/na/bs/";

        //TEST settings
        if (environment === "TEST") {
            _urlNaturtyper = "https://arcgis03.miljodirektoratet.no/arcgis/rest/services/faktaark/naturtyper_nin/MapServer/";            
            _indexNaturTypeAlle = 0;
            _indexRelationshipKartleggingsenhet = 0;
            _indexRelationshipBeskrivelsesVariabler = 1;
            _indexRelationshipDekningskart = 2;
            _agolWebMapID = "a758ae6e84f84b3fba426d14d7cc9d4b";
            _artsDatabankenKartlegginsenheter = "https://artsdatabanken.no/nin2.0/";
            _artsDatabankenBeskrivelsesvariabler = "https://artsdatabanken.no/nin/na/bs/";
        }

        //PROD settings
        if (environment === "PROD") {
            _urlNaturtyper = "https://arcgis03.miljodirektoratet.no/arcgis/rest/services/faktaark/naturtyper_nin/MapServer/";
            _indexNaturTypeAlle = 0;
            _indexRelationshipKartleggingsenhet = 0;
            _indexRelationshipBeskrivelsesVariabler = 1;
            _indexRelationshipDekningskart = 2;
            _agolWebMapID = "a758ae6e84f84b3fba426d14d7cc9d4b";
            _artsDatabankenKartlegginsenheter = "https://artsdatabanken.no/nin2.0/";
            _artsDatabankenBeskrivelsesvariabler = "https://artsdatabanken.no/nin/na/bs/";
        }

        var appconfig = {            
            path: {
                urlNaturtyper: _urlNaturtyper,
                urlArtsDatabankenKartleggingsEnheter: _artsDatabankenKartlegginsenheter,
                urlArtsDatabankenBeskrivelsesvariabler: _artsDatabankenBeskrivelsesvariabler
            },
          
            layerSettings: {
                indexNaturTypeAlle: _indexNaturTypeAlle,
                indexRelationshipKartleggingsenhet: _indexRelationshipKartleggingsenhet,
                indexRelationshipBeskrivelsesVariabler: _indexRelationshipBeskrivelsesVariabler,
                indexRelationshipDekningskart: _indexRelationshipDekningskart
            },

            map: {
                agolWebMapID: _agolWebMapID
            }
        };

        return appconfig;

    }
);