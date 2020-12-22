class CDUInitPage {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        let fromTo = "□□□□/□□□□[color]red";
        let cruiseFlTemp = "----- /---°";
        let costIndexCell = "---";
        if (mcdu.flightPlanManager.getOrigin() && mcdu.flightPlanManager.getOrigin().ident) {
            if (mcdu.flightPlanManager.getDestination() && mcdu.flightPlanManager.getDestination().ident) {
                fromTo = mcdu.flightPlanManager.getOrigin().ident + "/" + mcdu.flightPlanManager.getDestination().ident + "[color]blue";
                costIndexCell = "□□□[color]red";
                mcdu.onLeftInput[4] = () => {
                    const value = mcdu.inOut;
                    mcdu.clearUserInput();
                    if (mcdu.tryUpdateCostIndex(value)) {
                        CDUInitPage.ShowPage1(mcdu);
                    }
                };
                cruiseFlTemp = "□□□□□ /□□□[color]red";
                if (isFinite(mcdu.cruiseFlightLevel)) {
                    let temp = mcdu.tempCurve.evaluate(mcdu.cruiseFlightLevel);
                    if (isFinite(mcdu.cruiseTemperature)) {
                        temp = mcdu.cruiseTemperature;
                    }
                    cruiseFlTemp = "FL" + mcdu.cruiseFlightLevel.toFixed(0).padStart(3, "0") + " /" + temp.toFixed(0) + "°[color]blue";
                }
                mcdu.onLeftInput[5] = () => {
                    const value = mcdu.inOut;
                    mcdu.clearUserInput();
                    if (mcdu.setCruiseFlightLevelAndTemperature(value)) {
                        CDUInitPage.ShowPage1(mcdu);
                    }
                };
            }
        }
        let coRoute = "NONE[color]blue";
        if (mcdu.coRoute) {
            coRoute = mcdu.coRoute + "[color]blue";
            ;
        }
        let altDest = "-------[color]blue";
        if (mcdu.flightPlanManager.getDestination()) {
            altDest = "NONE[color]blue";
            if (mcdu.altDestination) {
                altDest = mcdu.altDestination.ident + "[color]blue";
            }
            mcdu.onLeftInput[1] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.tryUpdateAltDestination(value)) {
                    CDUInitPage.ShowPage1(mcdu);
                }
            };
        }
        let flightNo = SimVar.GetSimVarValue("ATC FLIGHT NUMBER", "string", "FMC");
        if (!flightNo) {
            flightNo = "--------";
        }
        let lat = "----.--";
        let long = "-----.--";
        console.log(mcdu.flightPlanManager.getOrigin());
        if (mcdu.flightPlanManager.getOrigin() && mcdu.flightPlanManager.getOrigin().infos && mcdu.flightPlanManager.getOrigin().infos.coordinates) {
            lat = mcdu.flightPlanManager.getOrigin().infos.coordinates.latToDegreeString() + "[color]blue";
            long = mcdu.flightPlanManager.getOrigin().infos.coordinates.longToDegreeString() + "[color]blue";
        }
        if (isFinite(mcdu.costIndex)) {
            costIndexCell = mcdu.costIndex + "[color]blue";
        }
        mcdu.setTemplate([
            ["INIT →"],
            ["CO RTE", "FROM/TO"],
            [coRoute, fromTo],
            ["ALTN/CO RTE"],
            [altDest],
            ["FLT NBR"],
            [flightNo + "[color]blue"],
            ["LAT", "LONG"],
            [lat, long],
            ["COST INDEX"],
            [costIndexCell, "WIND>"],
            ["CRZ FL/TEMP", "TROPO"],
            [cruiseFlTemp, "36090[color]blue"]
        ]);
        mcdu.onLeftInput[0] = async () => {
            const value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.updateCoRoute(value, (result) => {
                if (result) {
                    CDUInitPage.ShowPage1(mcdu);
                }
            });
        };
        mcdu.onRightInput[0] = () => {
            const value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.tryUpdateFromTo(value, (result) => {
                if (result) {
                    CDUAvailableFlightPlanPage.ShowPage(mcdu);
                }
            });
        };
        mcdu.onLeftInput[2] = () => {
            const value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.updateFlightNo(value, (result) => {
                if (result) {
                    CDUInitPage.ShowPage1(mcdu);
                }
            });
        };
        mcdu.onPrevPage = () => {
            CDUInitPage.ShowPage2(mcdu);
        };
        mcdu.onNextPage = () => {
            CDUInitPage.ShowPage2(mcdu);
        };
        Coherent.trigger("AP_ALT_VAL_SET", 4200);
        Coherent.trigger("AP_VS_VAL_SET", 300);
        Coherent.trigger("AP_HDG_VAL_SET", 180);
    }
    static ShowPage2(mcdu) {
        mcdu.updateFuelVars().then(() => {
            mcdu.clearDisplay();
            CDUInitPage._timer = 0;
            mcdu.pageUpdate = () => {
                CDUInitPage._timer++;
                if (CDUInitPage._timer >= 30) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let taxiFuelCell = "-.-";
            const taxiFuelWeight = mcdu.taxiFuelWeight;
            if (isFinite(taxiFuelWeight)) {
                taxiFuelCell = taxiFuelWeight.toFixed(1);
            }
            mcdu.onLeftInput[0] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetTaxiFuelWeight(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let tripWeightCell = "--.-";
            const tripWeight = mcdu.getFuelVarsUpdatedTripCons();
            if (isFinite(tripWeight)) {
                tripWeightCell = tripWeight.toFixed(1);
            }
            let tripTimeCell = "----";
            if (isFinite(mcdu.getTotalTripTime())) {
                tripTimeCell = FMCMainDisplay.secondsTohhmm(mcdu.getTotalTripTime());
            }
            let rteRsvWeightCell = "--.-";
            const rteRsvWeight = mcdu.getRouteReservedWeight();
            if (isFinite(rteRsvWeight)) {
                rteRsvWeightCell = rteRsvWeight.toFixed(1);
            }
            let rteRsvPercentCell = "-.-";
            const rteRsvPercent = mcdu.getRouteReservedPercent();
            if (isFinite(rteRsvPercent)) {
                rteRsvPercentCell = rteRsvPercent.toFixed(1);
            }
            mcdu.onLeftInput[2] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetRouteReservedFuel(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let rteFinalWeightCell = "--.-";
            const rteFinalWeight = mcdu.getRouteFinalFuelWeight();
            if (isFinite(rteFinalWeight)) {
                rteFinalWeightCell = rteFinalWeight.toFixed(1);
            }
            let rteFinalTimeCell = "----";
            const rteFinalTime = mcdu.getRouteFinalFuelTime();
            if (isFinite(rteFinalTime)) {
                rteFinalTimeCell = FMCMainDisplay.secondsTohhmm(rteFinalTime);
            }
            mcdu.onLeftInput[4] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetRouteFinalFuel(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let zfwColor = "[color]red";
            let zfwCell = "□□□.□";
            let zfwCgCell = " /□□.□";
            const zfw = mcdu.getZeroFuelWeight();
            if (isFinite(zfw)) {
                zfwCell = zfw.toFixed(1);
            }
            if (isFinite(mcdu.zeroFuelWeightMassCenter)) {
                zfwCgCell = " /" + mcdu.zeroFuelWeightMassCenter.toFixed(1);
            }
            if (isFinite(zfw) && isFinite(mcdu.zeroFuelWeightMassCenter)) {
                zfwColor = "[color]blue";
            }
            mcdu.onRightInput[0] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (value === "") {
                    mcdu.inOut = (isFinite(zfw) ? zfw.toFixed(1) : "") + "/" + (isFinite(mcdu.zeroFuelWeightMassCenter) ? mcdu.zeroFuelWeightMassCenter.toFixed(1) : "");
                } else if (await mcdu.trySetZeroFuelWeightZFWCG(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let blockFuelCell = "□□.□[color]red";
            const blockFuelWeight = mcdu.getBlockFuel(false);
            if (isFinite(blockFuelWeight)) {
                blockFuelCell = blockFuelWeight.toFixed(1) + "[color]blue";
            }
            let towCell = "---.-";
            let takeOffWeight = NaN;
            if (isFinite(zfw)) {
                if (isFinite(blockFuelWeight)) {
                    if (isFinite(taxiFuelWeight)) {
                        takeOffWeight = zfw + blockFuelWeight - taxiFuelWeight;
                    }
                }
            }
            if (isFinite(takeOffWeight)) {
                towCell = takeOffWeight.toFixed(1);
            }
            let lwCell = "---.-";
            let landingWeight = NaN;
            if (isFinite(takeOffWeight)) {
                if (isFinite(tripWeight)) {
                    landingWeight = takeOffWeight - tripWeight;
                }
            }
            if (isFinite(landingWeight)) {
                lwCell = landingWeight.toFixed(1);
            }
            mcdu.onRightInput[3] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetTakeOffWeightLandingWeight(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let tripWindCell = "---.-";
            if (isFinite(mcdu.averageWind)) {
                tripWindCell = mcdu.averageWind.toFixed(1);
            }
            mcdu.onRightInput[4] = async () => {
                const value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetAverageWind(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            mcdu.setTemplate([
                ["INIT →"],
                ["TAXI", "ZFW /ZFWCG"],
                [taxiFuelCell + "[color]blue", zfwCell + zfwCgCell + zfwColor],
                ["TRIP/TIME", "BLOCK"],
                [tripWeightCell + " /" + tripTimeCell + "[color]green", blockFuelCell],
                ["RTE RSV /%"],
                [rteRsvWeightCell + " /" + rteRsvPercentCell + "[color]blue"],
                ["ALTN /TIME", "TOW /LW"],
                ["--.-/----", towCell + " /" + lwCell + "[color]green"],
                ["FINAL /TIME", "TRIP WIND"],
                [rteFinalWeightCell + " /" + rteFinalTimeCell + "[color]blue", tripWindCell + "[color]blue"],
                ["MIN DEST FOB", "EXTRA /TIME"],
                ["-----", "--.-/----"]
            ]);
            mcdu.onPrevPage = () => {
                CDUInitPage.ShowPage1(mcdu);
            };
            mcdu.onNextPage = () => {
                CDUInitPage.ShowPage1(mcdu);
            };
        });
    }
}
CDUInitPage._timer = 0;
//# sourceMappingURL=A320_Neo_CDU_InitPage.js.map