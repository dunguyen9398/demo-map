import { makeObservable, observable, action, runInAction } from "mobx";
import { Geolocation, Position } from "@capacitor/geolocation";
import { Loader } from "@googlemaps/js-api-loader";
import { Clinic } from "../model/Clinic";

export class HomeViewModel {
  loading = true;
  userPosition: google.maps.LatLngLiteral | null = null;
  clinicsWithCoords: { clinic: Clinic; position: google.maps.LatLngLiteral }[] =
    [];

  constructor(public clinics: Clinic[]) {
    makeObservable(this, {
      loading: observable,
      userPosition: observable,
      clinicsWithCoords: observable,
      init: action,
    });
  }

  async init() {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      console.log("Current position:", position);

      const loader = new Loader({
        apiKey: "YOUR_API_KEY",
        version: "weekly",
        libraries: ["places", "marker"],
      });

      await loader.importLibrary("maps");
      await loader.importLibrary("marker");

      const center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const geocoder = new google.maps.Geocoder();
      const clinicResults: {
        clinic: Clinic;
        position: google.maps.LatLngLiteral;
      }[] = [];

      // Geocode each clinic
      for (const clinic of this.clinics) {
        const results = await new Promise<google.maps.GeocoderResult[]>(
          (resolve, reject) => {
            geocoder.geocode({ address: clinic.address }, (res, status) => {
              if (status === "OK" && res && res[0].geometry.location) {
                resolve(res);
              } else {
                reject(status);
              }
            });
          }
        );

        clinicResults.push({
          clinic,
          position: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          },
        });
      }

      runInAction(() => {
        this.userPosition = center;
        this.clinicsWithCoords = clinicResults;
      });
    } catch (error) {
      console.error("Error initializing data", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
