import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {CurtainWebAPI, User} from "curtain-web-api";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  curtainAPI: CurtainWebAPI = new CurtainWebAPI(environment.apiURL)

  isOwner: boolean = false


  constructor() {
    this.curtainAPI.axiosInstance.interceptors.request.use((config) => {
      if (config.url) {
        if (this.curtainAPI.checkIfRefreshTokenExpired() && this.curtainAPI.user.loginStatus === true) {
          this.curtainAPI.user.loginStatus = false
          this.curtainAPI.user.clearDB().then((data: any) => {
            this.curtainAPI.user = new User()
          })


          console.log(this.curtainAPI.user)

        }
        if (
          //config.url === this.refereshURL ||
          config.url === this.curtainAPI.logoutURL ||
          config.url === this.curtainAPI.userInfoURL ||
          config.url.startsWith(this.curtainAPI.baseURL + "curtain/") ||
          config.url.startsWith(this.curtainAPI.baseURL + "data_filter_list/")) {
          console.log(this.curtainAPI.user)
          if (this.curtainAPI.user.loginStatus) {
            config.headers["Authorization"] = "Bearer " + this.curtainAPI.user.access_token;
          }
        }
      }

      return config;
    }, (error) => {
      return Promise.reject(error);
    });
    this.curtainAPI.axiosInstance.interceptors.response.use((response) => {
      return response
    } , (error) => {
      console.log(error.response)
      if (error.response.status === 401) {
        if (error.config.url !== this.curtainAPI.refereshURL &&
          error.config.url !== this.curtainAPI.loginURL &&
          error.config.url !== this.curtainAPI.orcidLoginURL) {
          if (!this.curtainAPI.checkIfRefreshTokenExpired() && this.curtainAPI.user.loginStatus) {
            console.log("refreshing token")
            if (!this.curtainAPI.isRefreshing) {
              return this.refresh().then((response: any) => {
                this.curtainAPI.isRefreshing = false;
                return this.curtainAPI.axiosInstance.request(error.config);
              }).catch((error: any) => {
                this.curtainAPI.isRefreshing = false;
                this.curtainAPI.user = new User();
                return error;
              });
            }
          }
        }
      }
      return Promise.reject(error);
    });
  }

  reload() {
    return this.curtainAPI.user.loadFromDB().then((data) => {
      return data;
    })
  }

  getUser(reNavigate: boolean = false) {
    return this.curtainAPI.getUserInfo().then((data) => {

    }).catch((error: any) => {
      return error
    })
  }

  login(username: string, password: string) {
    return this.curtainAPI.login(username, password).then((data) => {return data}).catch((error: any) => {
      return error
    })
  }

  refresh() {
    return this.curtainAPI.refresh().then((data: any) => {return data}).catch((error: any) => {
      return error
    })
  }

  logout() {
    return this.curtainAPI.logout().then((data) => {
    }).catch((error: any) => {
      return error
    })
  }


  getSessionPermission(): boolean {
    if (this.curtainAPI.user.isStaff) {
      return true
    } else if (this.isOwner) {
      return true
    }
    return false
  }


  postORCIDCode(data: string) {
    return this.curtainAPI.ORCIDLogin(data, window.location.origin+"/").then((data: any) => {
      return data
    }).catch((error: any) => {
      return error
    })
  }

  ORCIDLogin(data: string) {
    return this.postORCIDCode(data).then((data) => {
      return data
    }).catch((error: any) => {
      return error
    })
  }


  deleteCurtainLink(link_id: string) {
    return this.curtainAPI.deleteCurtainLink(link_id).then((data) => {
      return data
    }).catch((error: any) => {
      return error
    })
  }
}
