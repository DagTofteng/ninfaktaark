define([
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
            var id = "NINFP1810002772";

            var urlNaturTyper = appconfig.path.urlNaturtyper + appconfig.layerSettings.indexNaturTypeAlle;
            var naturTyperFeatureLayer = new FeatureLayer({
                url: urlNaturTyper,
                outFields: ["*"]                
            });         

            //Observables/properties section------------------------------------------------------------            
            self.beskrivelsesVariabelList = ko.observableArray();
            self.naturMangfoldList = ko.observableArray();
            self.kartleggingsEnheterList = ko.observableArray();
            
            self.ninObjectId = ko.observable();
            self.naturType = ko.observable();
            self.utvalgsKriterium = ko.observable();
            self.lokalitetKvalitetID = ko.observable();
            self.lokalitetKvalitetTekst = ko.observable();
            self.ninID = ko.observable();
            self.lokalitetNavn = ko.observable();
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
            self.naturTypeBeskrivelseVisible = ko.observable(false);

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
            self.printNaturmangfold = ko.observable(false);
            self.printTilstand = ko.observable(false);
            self.printAvailable = ko.observable(false);

            //Functions section-------------------------------------------------------------------------
            self.startUp = function () {

                self.setEvents();

                var id_url = self.getURLParameter("id");
                if (id_url) {
                    id = id_url
                }
                var id_lower = id.toString().toLowerCase();
                var highlight;

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
                                color: [76, 230, 0, 1],    
                                haloOpacity: 0.4,
                                fillOpacity: 0.3
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
                        self.utvalgsKriterium("Ikke implementert - TODO");
                        self.lokalitetKvalitetID(feature.Lokalitetskvalitet);                        
                        self.lokalitetKvalitetTekst(self.getCodeTextFromID(feature.Lokalitetskvalitet, "Lokalitetskvalitet", result));
                        self.ninID(feature.NiNID);
                        self.lokalitetNavn(feature.Områdenavn);
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
                        self.naturTypeBeskrivelseKort("TODO - Kystlynghei omfatter åpne heipregete økosystemer som er betinget av lyngbrenning, gjerne i kombinasjon med beiting store deler av året og/eller slått. Dominans av dvergbusker, først og fremst nøkkelarten røsslyng (Calluna vulgaris), er typisk.");
                        self.naturTypeBeskrivelseLang("TODO - Kystlynghei omfatter åpne heipregete økosystemer som er betinget av lyngbrenning, gjerne i kombinasjon med beiting store deler av året og/eller slått. Dominans av dvergbusker, først og fremst nøkkelarten røsslyng (Calluna vulgaris), er typisk. Røsslyng har utviklet tilpasninger til det spesielle hevdregimet som har opprettholdt kystlynghei.Det er f.eks.dokumentert gjennom eksperimentelle undersøkelser at røsslyngfrøenes spiring begunstiges av brann(røyk) i, men ikke utenfor, kystlyngheibeltet(Måren et al. 2010).Kystlyngheier kan imidlertid ha sterkt innslag også av andre lyngarter, som f.eks.krekling(Empetrum nigrum), klokkelyng(Erica tetralix) og blokkebær(Vaccinium uliginosum) og / eller av lite kalkkrevende graminider, som blåtopp(Molinia caerulea) og bjørneskjegg(Trichophorum cespitosum).Kystlyngheier i bruk mangler eller har svært sparsom forekomst av moser og lav.Kystlyngheiene er formet gjennom rydding av kratt og trær og flere tusen års hevd, der nøkkelfaktoren i hevdregimet er lyngbrenning, og hvor typisk også beiting gjennom store deler av, eller hele, vekstsesongen er viktig(se Måren & Vandvik 2009, Måren et al. 2010, og NiN[2]AR1, kapittel B3h og Fig.B3–5).Et vintermildt(oseanisk) klima er en forutsetning for en lang beitesesong, og kystlynghei er derfor først og fremst knyttet til kystnære lavlandsområder.Kystlynghei finnes i et breit belte langs kysten fra Kragerø i Telemark til Lofoten i Nordland, kanskje også på Hvaler i Østfold som en nordlig utløper av det vestsvenske lyngheiområdet.Heier betinget av lyngbrenning, som skal tilordnes kystlyngheiene, forekommer imidlertid også i høyereliggende områder litt innenfor kysten, i Dalane(Rogaland) opp til ca. 400 m o.h. (Steinnes 1988).Størstedelen av kystlynghei - arealet gror nå igjen som følge av at bruken har opphørt");

                        // Get kartleggingsenheter
                        self.getRelationshipService(appconfig.layerSettings.indexRelationshipKartleggingsenhet, self.ninObjectId()).then(lang.hitch(self.ninObjectId(), function (resKE) {
                            //this == self.ninObjectId();
                            var tempArr = [];
                            if (resKE[this]) {

                                tempArr = resKE[this].features.map(function (k) {
                                    return k.attributes;
                                });

                                self.kartleggingsEnheterList(tempArr);
                            }
                        }));

                        // Get beskrivelsesvariabler
                        self.getRelationshipService(appconfig.layerSettings.indexRelationshipBeskrivelsesVariabler, self.ninObjectId()).then(lang.hitch(self.ninObjectId(), function (res) {
                            //this == self.ninObjectId();
                            if (res[this]) {
                                var attrList = res[this].features.map(function (a) {
                                    return a.attributes;
                                });
                                // Alle oppføringer som IKKE har "mangfold" i TypeVariabel feltet skal i beskrivelsesvariabel tabellen
                                var bvList = [];
                                var mangfoldList = [];
                                var urlArtsdb = "https://artsdatabanken.no/nin/na/bs/";
                                array.forEach(attrList, function (item) {
                                    if (item.TypeVariabel.toLowerCase().indexOf("mangfold") == -1) {
                                        //Hvis VariabelGruppe er MdirVariabel, så skal vi ikke linke til Artsdatabanken
                                        if (item.Variabelgruppe && item.Variabelgruppe.toLowerCase().indexOf("mdir") == -1) {
                                            if (item.Variabelkode && item.Variabelkode.length >= 3) {
                                                var url = [];
                                                url[0] = item.Variabelkode.substring(0, 1);
                                                url[1] = item.Variabelkode.substring(1, 3);
                                                item.UrlArtsdatabanken = urlArtsdb + url[0] + "/" + url[1];
                                            }
                                            else {
                                                item.UrlArtsdatabanken = null;
                                            }
                                        }
                                        else {
                                            item.UrlArtsdatabanken = null;
                                        }

                                        if (item.TypeVariabel) {
                                            item.TypeVariabel = item.TypeVariabel.split(" ")[0];
                                        }
                                        bvList.push(item);
                                    }
                                });
                                // Alle oppføringer som har "mangfold" i TypeVariabel feltet skal i naturmangfold tabellen                                
                                array.forEach(attrList, function (item) {
                                    if (item.TypeVariabel.toLowerCase().indexOf("mangfold") > -1) {
                                        //Hvis VariabelGruppe er MdirVariabel, så skal vi ikke linke til Artsdatabanken
                                        if (item.Variabelgruppe && item.Variabelgruppe.toLowerCase().indexOf("mdir") == -1) {                                            
                                            if (item.Variabelkode && item.Variabelkode.length >= 3) {
                                                var url = [];
                                                url[0] = item.Variabelkode.substring(0, 1);
                                                url[1] = item.Variabelkode.substring(1, 3);
                                                item.UrlArtsdatabanken = urlArtsdb + url[0] + "/" + url[1];
                                            }
                                            else {
                                                item.UrlArtsdatabanken = null;
                                            }
                                        }
                                        else {
                                            item.UrlArtsdatabanken = null;
                                        }

                                        if (item.TypeVariabel) {
                                            item.TypeVariabel = item.TypeVariabel.split(" ")[0];
                                        }
                                        mangfoldList.push(item);
                                    }
                                });

                                var bvListSorted = bvList.sort(function (a, b) { return a.TypeVariabel.localeCompare(b.TypeVariabel) });
                                var mangfoldListSorted = mangfoldList.sort(function (a, b) { return a.TypeVariabel.localeCompare(b.TypeVariabel) });
                                self.beskrivelsesVariabelList(bvListSorted);
                                self.naturMangfoldList(mangfoldListSorted);
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
                    };
                });
                
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
      
            self.getRelationshipService = function (relationShipID, objectIDs) {
                //relationshipId 0 = "kartleggingsenheter"
                //relationshipId 1 = "beskrivelsesvariabler"
                //relationshipId 2 = "dekningskart"                
                var query = this.createRelationshipQuery(false, ["*"], relationShipID, objectIDs);
                var queryTask = new QueryTask({
                    url: urlNaturTyper
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

              
            };


            self.startUp();
        };

        return { viewModel: MainContentViewModel, template: MainContentTemplate };

    });