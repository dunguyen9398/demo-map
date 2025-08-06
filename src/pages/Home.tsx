import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
} from "@ionic/react";

import { Clinic } from "./model/Clinic";
import { useEffect, useRef, useState } from "react";
import { Observer } from "mobx-react-lite";
import { HomeViewModel } from "./viewmodel/homeViewModel";

const clinics: Clinic[] = [
  { id: "1", name: "City Health Clinic", address: "123 Main St, New York, NY" },
  { id: "2", name: "WellCare Medical", address: "456 Park Ave, New York, NY" },
];

const Home: React.FC = () => {
  const [viewmodel] = useState(new HomeViewModel(clinics));
  const mapRef = useRef<HTMLDivElement>(null);
  console.log("Home component initialized");
  useEffect(() => {
    console.log("Initializing HomeViewModel...");
    viewmodel.init();
  }, [viewmodel]);

  useEffect(() => {
    if (!viewmodel.loading && mapRef.current && viewmodel.userPosition) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: viewmodel.userPosition,
        zoom: 13,
      });

      // User marker
      new google.maps.marker.AdvancedMarkerElement({
        position: viewmodel.userPosition,
        map: mapInstance,
        title: "You are here",
      });

      // Clinic markers
      viewmodel.clinicsWithCoords.forEach(({ clinic, position }) => {
        new google.maps.marker.AdvancedMarkerElement({
          position,
          map: mapInstance,
          title: clinic.name,
        });
      });
    }
  }, [viewmodel.loading, viewmodel.userPosition, viewmodel.clinicsWithCoords]);

  return (
    <Observer>
      {() => {
        return (
          <IonPage>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Clinics</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              {viewmodel.loading ? (
                <div className="ion-text-center ion-padding">
                  <IonSpinner name="crescent" />
                </div>
              ) : (
                <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
              )}
            </IonContent>
          </IonPage>
        );
      }}
    </Observer>
  );
};

export default Home;
