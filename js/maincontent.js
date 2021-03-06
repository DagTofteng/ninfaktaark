﻿define([
    "dojo/text!js/maincontent.html",
    "dojo/topic",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/request/xhr",
    "js/appconfig",
    'esri/layers/FeatureLayer',    
    "esri/Map",
    "esri/request",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/tasks/support/RelationshipQuery",
    "esri/views/MapView",
    "esri/views/layers/FeatureLayerView",
    "esri/WebMap"
], function (
    MainContentTemplate,
    topic,
    array,
    lang,
    xhr,
    appconfig,
    FeatureLayer,    
    Map,
    esriRequest,
    QueryTask,
    Query,
    RelationshipQuery,
    MapView,
    FeatureLayerView,
    WebMap
) {

        var MainContentViewModel = function () {
            var self = this;           

            
            var naturTyperFeatureLayer = new FeatureLayer({
                url: appconfig.path.urlNaturtyper + appconfig.layerSettings.indexNaturTypeAlle,
                outFields: ["*"]                
            });    
            var beskrivelsesVariablerFeatureLayer = new FeatureLayer({
                url: appconfig.path.urlNaturtyper + appconfig.layerSettings.indexTableBeskrivelsesVariabler,
                outFields: ["*"]
            });    
            var naturtypeBeskrivelseFeatureLayer = new FeatureLayer({
                url: appconfig.path.urlNaturtyper + appconfig.layerSettings.indexTableNaturtypeBeskrivelse,
                outFields: ["*"]
            });    

            //Observables/properties section------------------------------------------------------------            
            self.beskrivelsesVariabelList = ko.observableArray();
            self.naturMangfoldList = ko.observableArray();
            self.kartleggingsEnheterList = ko.observableArray();
            self.definerendeList = ko.observableArray();
            
            self.ninObjectId = ko.observable();
            self.naturType = ko.observable();
            self.utvalgsKriterium = ko.observable();
            self.lokalitetKvalitetID = ko.observable();
            self.lokalitetKvalitetTekst = ko.observable();
            self.ninID = ko.observable();
            self.omradeNavn = ko.observable();
            self.kommune = ko.observable();            
            self.tilstandID = ko.observable();
            self.tilstandTekst = ko.observable();            
            self.tilstandBeskrivelse = ko.observable();
            self.tilstandBeskrivelseVisible = ko.observable(false);
            self.naturMangfoldID = ko.observable();
            self.naturMangfoldTekst = ko.observable();
            self.naturMangfoldBeskrivelse = ko.observable();
            self.naturMangfoldBeskrivelseVisible = ko.observable(false);

            self.areal = ko.observable();
            self.hovedOkosystem = ko.observable();
            self.mosaikkID = ko.observable();
            self.mosaikkTekst = ko.observable();
            self.noyaktighetID = ko.observable();
            self.usikkerhetTekst = ko.observable();
            self.noyaktighetTekst = ko.observable();
            self.usikkerhetID = ko.observable();
            self.usikkerhetBeskrivelse = ko.observable();
            self.kartleggingsDato = ko.observable();
            self.kartleggingsAar = ko.observable();
            self.oppdragsgiverID = ko.observable();
            self.oppdragsgiverTekst = ko.observable();
            self.kartleggerFirma = ko.observable();
            self.kartlegger = ko.observable();
            self.naturTypeKode = ko.observable();
            self.naturTypeBeskrivelseKort = ko.observable();
            self.naturTypeBeskrivelseLang = ko.observable();
            self.naturTypeBeskrivelseShowReadMore = ko.computed(function () {
                return self.naturTypeBeskrivelseLang() && self.naturTypeBeskrivelseLang().length > 800;
            });
            self.naturTypeBeskrivelseVisible = ko.observable(false);
            self.naturTypeBeskrivelseArtsDBUrl = ko.observable();
            self.naturTypeBeskrivelseNavarendeStatus2018 = ko.observable();
            self.rodlistStatus = ko.observable();

            self.dekningAarstall = ko.observable();
            self.dekningKartleggerFirma = ko.observable();
            self.dekningKartleggingsInstruks = ko.observable();
            self.dekningOppdragsgiver = ko.observable();
            self.dekningProgram = ko.observable();
            self.dekningProgramKode = ko.observable();
            self.dekningProsjektomradenavn = ko.observable();
            self.dekningProsjektnavn = ko.observable();
            self.dekningAreal = ko.observable();

            self.photoList = ko.observableArray();
            self.photoListTop3 = ko.computed(function () {
                return self.photoList().slice(0, 3);
            });

            self.thumbnailText = ko.observable();

            self.printPopupVisible = ko.observable(false);
            self.printIncludeList = ko.observableArray();

            self.printBilder = ko.observable(false);
            self.printNaturmangfold = ko.observable(true);
            self.printTilstand = ko.observable(true);
            self.printAvailable = ko.observable(false);

            self.beskrivelsesVariabelMdirList = [];

            //Functions section-------------------------------------------------------------------------
            self.startUp = function () {

                self.setEvents();

                var highlight;
                var id_url = self.getURLParameter("id");
                if (id_url) {
                    var id_lower = id_url.toString().toLowerCase();

                    //// Henter inn kodelister og lagrer lokalt
                    self.getBeskivelsesVariablerMdir().then(function (resBVMdir) {
                        if (resBVMdir.features.length > 0) {
                            self.beskrivelsesVariabelMdirList = resBVMdir.features.map(function (a) { return a.attributes });
                        }
                    });
                    self.getNaturtyper(id_lower).then(function (result) {
                        if (result.features.length > 0) {
                            var feature = result.features[0].attributes;
                            var geometry = result.features[0].geometry;

                            // TODO - get photoes from service
                            var photoes = [
                                { url: "https://placeimg.com/600/300/nature" },
                                { url: "https://placeimg.com/600/300/tech" },
                                { url: "https://placeimg.com/600/300/arch" },
                                { url: "https://placeimg.com/600/300/people" },
                                { url: "https://placeimg.com/600/300/animals" }
                            ];
                            self.photoList(photoes);
                            if (self.photoList().length > 3) {
                                var countMoreThan3 = self.photoList().length - 3;
                                self.thumbnailText("+ " + countMoreThan3 + " bilder");
                            }

                            var webmap = new WebMap({
                                portalItem: {
                                    id: appconfig.map.agolWebMapID
                                }
                            });

                           

                            self.faktaarkMap = new MapView({
                                id: 'faktaarkMap',
                                container: 'mapViewDiv',
                                map: webmap,
                                highlightOptions: {
                                    color: [75, 255, 0, 1],
                                    haloOpacity: 0.4,
                                    fillOpacity: 0.5
                                }
                            });



                            self.faktaarkMap.when(function (evt) {
                                var layer = webmap.allLayers.find(function (layer) {
                                    return layer.id === "naturtyper_nin_8699";
                                });

                                self.faktaarkMap.whenLayerView(layer).then(function (layerView) {
                                    var query = layer.createQuery();
                                    query.where = "lower(NiNID)='" + id_lower + "'";
                                    layer.queryFeatures(query).then(function (result) {
                                        if (highlight) {
                                            highlight.remove();
                                        }
                                        highlight = layerView.highlight(result.features);
                                        layer.refresh();
                                        self.faktaarkMap.goTo(geometry);
                                        self.printAvailable(true);
                                    });
                                });




                            });





                            self.ninObjectId(feature.OBJECTID);
                            self.naturType(feature.Naturtype);
                            
                            self.lokalitetKvalitetID(feature.Lokalitetskvalitet);
                            self.lokalitetKvalitetTekst(self.getCodeTextFromID(feature.Lokalitetskvalitet, "Lokalitetskvalitet", result));
                            self.ninID(feature.NiNID);
                            self.omradeNavn(feature.Områdenavn);
                            self.kommune(feature.Kommuner);
                            self.tilstandID(feature.Tilstand);
                            self.tilstandTekst(self.getCodeTextFromID(feature.Tilstand, "Tilstand", result));
                            self.tilstandBeskrivelse(feature.Tilstandbeskrivelse);
                            self.naturMangfoldBeskrivelse(feature.Naturmangfoldbeskrivelse);
                            self.naturMangfoldID(feature.Naturmangfold);
                            self.naturMangfoldTekst(self.getCodeTextFromID(feature.Naturmangfold, "Naturmangfold", result));

                            var areal = Math.round(feature["SHAPE.STArea()"]);
                            self.areal(areal.toLocaleString('no-NB') + ' m²');
                            self.hovedOkosystem(feature.Hovedøkosystem);
                            self.mosaikkID(feature.Mosaikk);
                            self.mosaikkTekst(self.getCodeTextFromID(feature.Mosaikk, "Mosaikk", result));
                            self.noyaktighetID(feature.Nøyaktighet);
                            self.noyaktighetTekst(self.getCodeTextFromID(feature.Nøyaktighet, "Nøyaktighet", result));
                            self.usikkerhetID(feature.Usikkerhet);
                            self.usikkerhetTekst(self.getCodeTextFromID(feature.Usikkerhet, "Usikkerhet", result));
                            self.usikkerhetBeskrivelse(feature.Usikkerhetsbeskrivelse);
                            self.kartleggingsDato(new Date(feature.Kartleggingsdato).toLocaleDateString('no-NB'));
                            self.kartleggingsAar(feature.Kartleggingsår);
                            self.oppdragsgiverID(feature.Oppdragsgiver);
                            self.oppdragsgiverTekst(self.getCodeTextFromID(feature.Oppdragsgiver, "Oppdragsgiver", result));
                            self.kartleggerFirma(feature.KartleggerFirma);
                            self.kartlegger(feature.Kartlegger);
                            self.naturTypeKode(feature.Naturtypekode);
                            

                            // Get kartleggingsenheter
                            self.getRelationshipService(appconfig.layerSettings.indexRelationshipKartleggingsenhet, self.ninObjectId()).then(lang.hitch(self.ninObjectId(), function (resKE) {
                                //this == self.ninObjectId();
                                var tempArr = [];
                                if (resKE[this]) {

                                    tempArr = resKE[this].features.map(function (k) {
                                        return k.attributes;
                                    });
                                    var keArr = [];
                                    var urlArtsdbKE = appconfig.path.urlArtsDatabankenKartleggingsEnheter;
                                    array.forEach(tempArr, function (item) {
                                        if (item.NiN_kode) {
                                            var kodeSplit = item.NiN_kode.split("NA_");
                                            var kode = item.NiN_kode;
                                            if (kodeSplit.length > 1) {
                                                kode = kodeSplit[1];
                                            }
                                            item.UrlNiN_kode = urlArtsdbKE + kode;
                                        }
                                        else {
                                            item.UrlNin_kode = null;
                                        }
                                        keArr.push(item);
                                    });


                                    self.kartleggingsEnheterList(keArr);
                                }
                            }));

                            // Get beskrivelsesvariabler
                            self.getRelationshipService(appconfig.layerSettings.indexRelationshipBeskrivelsesVariabler, self.ninObjectId()).then(lang.hitch(self.ninObjectId(), function (res) {
                                //this == self.ninObjectId();
                                if (res[this]) {
                                    var attrList = res[this].features.map(function (a) {
                                        return a.attributes;
                                    });                                   
                                   
                                    var urlArtsdbBS = appconfig.path.urlArtsDatabankenBeskrivelsesystem;
                                    var urlArtsdbLKM = appconfig.path.urlArtsDatabankenLKM;

                                    
                                    var mangfoldList = attrList.filter(function (item) { return item.TypeVariabel.toLowerCase().indexOf("mangfold") > -1 });
                                    var beskrivelsesVariabelList = attrList.filter(function (item) { return item.TypeVariabel.toLowerCase().indexOf("tilstand") > -1 });
                                    var definerendeList = attrList.filter(function (item) { return item.TypeVariabel.toLowerCase().indexOf("definerende") > -1 });

                                    array.forEach(beskrivelsesVariabelList, function (item) {
                                        item.VariabelTitle = "";
                                        var url = [];                                        
                                        //Hvis VariabelGruppe IKKE er MdirVariabel, link til Artsdatabanken
                                        if (item.Variabelgruppe && item.Variabelgruppe.toLowerCase().indexOf("mdir") == -1) {
                                            if (item.Variabelkode && item.Variabelkode.length >= 3) {

                                                url[0] = item.Variabelkode.substring(0, 1);
                                                url[1] = item.Variabelkode.substring(1, 3);
                                                item.UrlArtsdatabanken = urlArtsdbBS + url[0] + "/" + url[1];
                                            }
                                            else {
                                                item.UrlArtsdatabanken = null;
                                            }
                                        }
                                        // Hvis VariabelGruppe ER Mdir slår vi opp mot tjenesten
                                        else {

                                            item.UrlArtsdatabanken = "javascript:void(0)";
                                            array.forEach(self.beskrivelsesVariabelMdirList, function (bv) {
                                                if (bv.MdirBVKode == item.Variabelkode.substring(0, 4)) {
                                                    item.VariabelTitle = bv.MdirBVBeskrivelse;
                                                }
                                            });
                                                
                                        }

                                        if (item.Variabelkode.substring(0, 3).toLowerCase() == "lkm") {
                                            url[0] = item.Variabelkode.substring(0, 3);
                                            url[1] = item.Variabelkode.substring(3, 5);
                                            item.UrlArtsdatabanken = urlArtsdbLKM + url[0] + "/" + url[1];
                                        }


                                        if (item.TypeVariabel) {
                                            item.TypeVariabel = item.TypeVariabel.split(" ")[0];
                                        }                                       
                                        
                                    });
                                    
                                    array.forEach(mangfoldList, function (item) {
                                        item.VariabelTitle = "";                                        
                                        //Hvis VariabelGruppe IKKE er MdirVariabel, så skal vi linke til Artsdatabanken
                                        if (item.Variabelgruppe && item.Variabelgruppe.toLowerCase().indexOf("mdir") == -1) {
                                            if (item.Variabelkode && item.Variabelkode.length >= 3) {
                                                var url = [];
                                                url[0] = item.Variabelkode.substring(0, 1);
                                                url[1] = item.Variabelkode.substring(1, 3);
                                                item.UrlArtsdatabanken = urlArtsdbBS + url[0] + "/" + url[1];
                                            }
                                            else {
                                                item.UrlArtsdatabanken = null;
                                            }
                                        }
                                        // Hvis VariabelGruppe ER Mdir slår vi opp mot tjenesten
                                        else {
                                            item.UrlArtsdatabanken = "javascript:void(0)";
                                            array.forEach(self.beskrivelsesVariabelMdirList, function (bv) {
                                                if (bv.MdirBVKode == item.Variabelkode.substring(0,4)) {
                                                    item.VariabelTitle = bv.MdirBVBeskrivelse;
                                                }
                                            });
                                        }

                                        if (item.TypeVariabel) {
                                            item.TypeVariabel = item.TypeVariabel.split(" ")[0];
                                        }
                                    });

                                    array.forEach(definerendeList, function (item) {
                                        item.VariabelTitle = "";                                        
                                        if (item.Variabelgruppe && item.Variabelgruppe.toLowerCase().indexOf("mdir") == -1) {
                                            if (item.Variabelkode && item.Variabelkode.length >= 3) {
                                                var url = [];
                                                url[0] = item.Variabelkode.substring(0, 1);
                                                url[1] = item.Variabelkode.substring(1, 3);
                                                item.UrlArtsdatabanken = urlArtsdbBS + url[0] + "/" + url[1];
                                            }
                                            else {
                                                item.UrlArtsdatabanken = null;
                                            }
                                        }
                                        // Hvis VariabelGruppe ER Mdir slår vi opp mot tjenesten
                                        else {
                                            item.UrlArtsdatabanken = "javascript:void(0)";
                                            array.forEach(self.beskrivelsesVariabelMdirList, function (bv) {
                                                if (bv.MdirBVKode == item.Variabelkode.substring(0, 4)) {
                                                    item.VariabelTitle = bv.MdirBVBeskrivelse;
                                                }
                                            });
                                        }

                                        if (item.TypeVariabel) {
                                            item.TypeVariabel = item.TypeVariabel.split(" ")[0];
                                        }
                                    });

                                    var bvListSorted = beskrivelsesVariabelList.sort(function (a, b) { return a.TypeVariabel.localeCompare(b.TypeVariabel) });
                                    var mangfoldListSorted = mangfoldList.sort(function (a, b) { return a.TypeVariabel.localeCompare(b.TypeVariabel) });
                                    var definerendeListSorted = definerendeList.sort(function (a, b) { return a.TypeVariabel.localeCompare(b.TypeVariabel) });
                                    self.beskrivelsesVariabelList(bvListSorted);
                                    self.naturMangfoldList(mangfoldListSorted);
                                    self.definerendeList(definerendeListSorted);

                                    
                                    
                                }
                            }));

                            // Get dekningskart
                            self.getRelationshipService(appconfig.layerSettings.indexRelationshipDekningskart, self.ninObjectId()).then(lang.hitch(self.ninObjectId(), function (resDekn) {
                                //this == self.ninObjectId();
                                if (resDekn[this]) {
                                    var obj = resDekn[this].features[0].attributes;
                                    self.dekningAarstall(obj.Årstall);
                                    self.dekningKartleggerFirma(obj.KartleggerFirma);
                                    self.dekningKartleggingsInstruks(obj.Kartleggingsinstruks);
                                    self.dekningOppdragsgiver(obj.Oppdragsgiver);
                                    self.dekningProgram(obj.Program);
                                    self.dekningProgramKode(obj.Programkode);
                                    self.dekningProsjektomradenavn(obj.Prosjektområdenavn);
                                    self.dekningProsjektnavn(obj.Prosjektnavn);
                                    var dekningAreal = Math.round(obj["SHAPE.STArea()"]);
                                    self.dekningAreal(dekningAreal.toLocaleString('no-NB') + ' m²');
                                }
                            }));

                            self.getNaturtypeBeskrivelse(feature.Naturtypekode).then(function (naturTypeRes) {
                                if (naturTypeRes.features.length > 0) {
                                    var feature = naturTypeRes.features[0].attributes;      
                                    self.naturTypeBeskrivelseLang(feature.NaturtypeBeskrivelse);
                                    self.naturTypeBeskrivelseKort(feature.NaturtypeBeskrivelse.substring(0, 800));
                                    self.utvalgsKriterium(feature.Utvalgskriterium);
                                    self.rodlistStatus(feature.Rodlistestatus);
                                    if (feature.ArtsdatabankenURL) {
                                        self.naturTypeBeskrivelseArtsDBUrl(feature.ArtsdatabankenURL);
                                    }
                                    if (feature.NavarendeStatus2018Data) {
                                        self.naturTypeBeskrivelseNavarendeStatus2018(feature.NavarendeStatus2018Data);
                                    }
                                    
                                }
                            });
                        };
                    });
                }
                
            };

            self.createQuery = function (returnGeometry, outFields, distinct, where) {
                var query = new Query();
                query.returnGeometry = returnGeometry;
                query.outFields = outFields;
                query.where = where;
                query.returnDistinctValues = distinct;
                return query;
            };

            self.createRelationshipQuery = function (returnGeometry, outFields, relationshipID, objectIDs) {
                var relQuery = new RelationshipQuery();
                relQuery.returnGeometry = returnGeometry;
                relQuery.outFields = outFields;
                relQuery.objectIds = [objectIDs];
                relQuery.relationshipId = relationshipID;
                return relQuery;
            };

            self.getNaturtyper = function (id) {
                var query = this.createQuery(true, ["*"], false, "lower(NiNID) = '" + id + "'");
                return naturTyperFeatureLayer.queryFeatures(query);
            };

            self.getNaturtypeBeskrivelse = function (id) {
                var query = this.createQuery(false, ["*"], false, "lower(Naturtypekode) = '" + id + "'");
                return naturtypeBeskrivelseFeatureLayer.queryFeatures(query);
            };
            // Henter alle og lagrer i minnet - for å slippe å kalle tjenesten en gang pr linje
            self.getBeskivelsesVariablerMdir = function (id) {
                //var query = this.createQuery(false, ["*"], false, "lower(MdirBVKode) = '" + id + "'");
                var query = this.createQuery(false, ["*"], false, "1=1");
                return beskrivelsesVariablerFeatureLayer.queryFeatures(query);
            };
            
            self.getRelationshipService = function (relationShipID, objectIDs) {
                //relationshipId 0 = "kartleggingsenheter"
                //relationshipId 1 = "beskrivelsesvariabler"
                //relationshipId 2 = "dekningskart"                
                var query = this.createRelationshipQuery(false, ["*"], relationShipID, objectIDs);
                var queryTask = new QueryTask({
                    url: appconfig.path.urlNaturtyper + appconfig.layerSettings.indexNaturTypeAlle
                });
                return queryTask.executeRelationshipQuery(query);
            };

            self.toggleTilstandBeskrivelse = function () {
                self.tilstandBeskrivelseVisible(!self.tilstandBeskrivelseVisible());
            };

            self.toggleNaturMangfoldBeskrivelse = function () {
                self.naturMangfoldBeskrivelseVisible(!self.naturMangfoldBeskrivelseVisible());
            };
            self.toggleNaturTypeBeskrivelse = function () {
                self.naturTypeBeskrivelseVisible(!self.naturTypeBeskrivelseVisible());
            };

            self.getCodeTextFromID = function (feltID, felt, result) {               
                var domainCodeList = naturTyperFeatureLayer.getFieldDomain(felt, { feature: result.features[0] });
                if (domainCodeList) {
                    for (var i = 0; i < domainCodeList.codedValues.length; i++) {
                        if (domainCodeList.codedValues[i].code == feltID) {
                            return (domainCodeList.codedValues[i].name);
                        }
                    }
                }
                // Default verdi hvis ikke det finnes noen coded-value
                return feltID;
            };

            self.getURLParameter = function (name) {
                var id = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search.toLowerCase()) || [, ''])[1].replace(/\+/g, '%20')) || null;
                if (id) {
                    return id;
                }
                else {
                    console.log("Mangler parameter '" + id + "'.");
                    return null;
                }
            };

            self.togglePrintPopup = function () {                
                self.printPopupVisible(!self.printPopupVisible());
            };

            self.printPage = function () {
                self.naturMangfoldBeskrivelseVisible(true);
                self.naturTypeBeskrivelseVisible(true);
                self.tilstandBeskrivelseVisible(true);
                self.takeScreenShot();
                self.takeScreenShot();

                //takeScreenshot må ha litt tid på å skrive til img-taggen
                setTimeout(function () {
                    window.print();
                    self.naturMangfoldBeskrivelseVisible(false);
                    self.naturTypeBeskrivelseVisible(false);
                    self.tilstandBeskrivelseVisible(false);
                }, 1000);
            };

            self.takeScreenShot = function () {
                self.faktaarkMap.takeScreenshot().then(function (screenshot) {
                    var imageElement = document.getElementById("mapSceenshot");
                    imageElement.src = screenshot.dataUrl;

                });
            };

         

            self.setEvents = function () {
                $(document).on("click", "#thumbnailGallery img, #thumbnailGallery a", function () {
                    $("#modalGallery").modal("show");
                });

                $(document).tooltip({ selector: '[data-toggle="tooltip"]' });                

                self.setAutoCompleteSearch();
              
            };

            self.queryLocations = function(query, suggest) {
                var url = appconfig.path.urlNaturtyper + appconfig.layerSettings.indexNaturTypeAlle + "/query";                
                var options = {
                    query: {
                        f: 'json',
                        outFields: ["NiNID,Områdenavn"],
                        where: "lower(Områdenavn) like '%" + query + "%' OR lower(NiNID) like '%" + query + "%'",
                        orderByFields: ["NiNID"],
                        resultRecordCount: 20
                    },
                    responseType: 'json'
                }
                esriRequest(url, options).then(function (response) {
                    var arr = response.data.features.map(function (a) {
                        var obj = {
                            name: a.attributes.Områdenavn,
                            id: a.attributes.NiNID
                        }
                        return obj;
                    });
                    return suggest(arr);
                });
            };

            self.setAutoCompleteSearch = function () {
                $('#searchInput').autoComplete(                    
                    {                        
                        minChars: 1,
                        cache: false,
                        source: function (query, suggest) {
                            return self.queryLocations(query, suggest);                            
                        },
                        renderItem: function (item, search) {                                  
                            return '<div class="autocomplete-suggestion" data-langname="' + item.id + '" data-lang="' + item.name + '" data-val="' + search + '">' + item.id + ' - ' + item.name + '</div>';
                        },
                        onSelect: function (e, term, item) {
                            var id = item.data('langname');
                            var url = [location.protocol, '//', location.host, location.pathname].join('');
                            window.location.href = url + "?id=" + id;
                        }
                    });            
            }


            self.startUp();
        };

        return { viewModel: MainContentViewModel, template: MainContentTemplate };

    });