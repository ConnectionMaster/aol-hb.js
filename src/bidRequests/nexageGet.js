import utils from 'helpers/utils';
import BaseBidRequest from './baseBidRequest';

class NexageGetBidRequest extends BaseBidRequest {
  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://hb.nexage.com/bidRequest?
      dcn=${'dcn'}&pos=${'pos'}&cmd=bid${'ext'}`;
    let options = {
      protocol: utils.resolveHttpProtocol(),
      dcn: this.bidRequestConfig.dcn,
      pos: this.placementConfig.pos,
      ext: this.formatDynamicParams()
    };

    return url(options);
  }

  formatDynamicParams() {
    let params = '';
    let ext = this.placementConfig.ext;

    for (let key in ext) {
      if (ext.hasOwnProperty(key)) {
        params += encodeURI(`&${key}=${ext[key]}`);
      }
    }

    return params;
  }
}

export default NexageGetBidRequest;
