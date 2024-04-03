import withStyles from '@mui/styles/withStyles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FacebookShareButton } from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import CampaignSupporterActions from '../../actions/CampaignSupporterActions';
import AppObservableStore, { messageService } from '../../stores/AppObservableStore';
import CampaignStore from '../../stores/CampaignStore';
import { isAndroid, isCordova } from '../../utils/isCordovaOrWebApp';
import { renderLog } from '../../utils/logging';
import politicianListToSentenceString from '../../utils/politicianListToSentenceString';
import { androidFacebookClickHandler, generateQuoteForSharing, generateSharingLink } from './shareButtonCommon';

class ShareOnFacebookButton extends Component {
  constructor (props) {
    super(props);
    this.state = {
      campaignX: {},
      inPrivateLabelMode: false,
      numberOfPoliticians: 0,
      politicianListSentenceString: '',
    };
  }

  componentDidMount () {
    // console.log('ShareOnFacebookButton componentDidMount');
    this.onAppObservableStoreChange();
    this.appStateSubscription = messageService.getMessage().subscribe(() => this.onAppObservableStoreChange());
    this.onCampaignStoreChange();
    this.campaignStoreListener = CampaignStore.addListener(this.onCampaignStoreChange.bind(this));
  }

  componentDidUpdate (prevProps) {
    // console.log('ShareOnFacebookButton componentDidUpdate');
    const {
      campaignXWeVoteId: campaignXWeVoteIdPrevious,
    } = prevProps;
    const {
      campaignXWeVoteId,
    } = this.props;
    if (campaignXWeVoteId) {
      if (campaignXWeVoteId !== campaignXWeVoteIdPrevious) {
        this.onCampaignStoreChange();
      }
    }
  }

  componentWillUnmount () {
    this.appStateSubscription.unsubscribe();
    this.campaignStoreListener.remove();
  }

  onAppObservableStoreChange () {
    const inPrivateLabelMode = AppObservableStore.inPrivateLabelMode();
    this.setState({
      inPrivateLabelMode,
    });
  }

  onCampaignStoreChange () {
    const { campaignXWeVoteId } = this.props;
    const campaignX = CampaignStore.getCampaignXByWeVoteId(campaignXWeVoteId);
    const campaignXPoliticianList = CampaignStore.getCampaignXPoliticianList(campaignXWeVoteId);
    let numberOfPoliticians = 0;
    if (campaignXPoliticianList && campaignXPoliticianList.length > 0) {
      numberOfPoliticians = campaignXPoliticianList.length;
    }
    let politicianListSentenceString = '';
    if (numberOfPoliticians > 0) {
      politicianListSentenceString = politicianListToSentenceString(campaignXPoliticianList);
    }
    this.setState({
      campaignX,
      numberOfPoliticians,
      politicianListSentenceString,
    });
  }

  generateFullCampaignLink = () => {
    const { campaignXNewsItemWeVoteId } = this.props;
    const { campaignX } = this.state;
    return generateSharingLink(campaignX, campaignXNewsItemWeVoteId);
  }

  saveActionShareButton = () => {
    CampaignSupporterActions.shareButtonClicked(true);
  }

  render () {
    renderLog('ShareOnFacebookButton');  // Set LOG_RENDER_EVENTS to log all renders
    if (isCordova()) {
      console.log(`ShareOnFacebookButton window.location.href: ${window.location.href}`);
    }
    const { darkButton, mobileMode } = this.props;
    const { campaignX, inPrivateLabelMode, numberOfPoliticians, politicianListSentenceString } = this.state;
    const {
      campaign_title: campaignTitle,
    } = campaignX;
    let linkToBeShared = this.generateFullCampaignLink();
    let linkToBeSharedUrlEncoded = '';
    linkToBeShared = linkToBeShared.replace('https://file:/', 'https://wevote.us/');  // Cordova
    linkToBeSharedUrlEncoded = encodeURI(linkToBeShared);
    console.log(`ShareOnFacebookButton linkToBeShared: ${linkToBeShared}`)
    const quoteForSharing = generateQuoteForSharing(campaignTitle, numberOfPoliticians, politicianListSentenceString);
    console.log(`ShareOnFacebookButton quoteForSharing: ${quoteForSharing}`)
    const quoteForSharingEncoded = encodeURI(quoteForSharing);
    return (
      <Wrapper>
        <div id="androidFacebook"
             onClick={() => isAndroid() &&
               androidFacebookClickHandler(`${linkToBeSharedUrlEncoded}&t=WeVote`, quoteForSharingEncoded)}
        >
          { /* [WV-104] - If react-share restores the quote feature, add in this prop to FacebookShareButton: quote={quoteForSharing} */ }
          <CopyToClipboard text={quoteForSharing} onCopy={() => console.log(`Copied the following: ${quoteForSharing}`)}>
          <FacebookShareButton
            className={mobileMode ? 'material_ui_button_mobile' : ''}
            hashtag={inPrivateLabelMode ? null : '#WeVote'}
            id="shareOnFacebookButton"
            onClick={this.saveActionShareButton}
            url={`${linkToBeSharedUrlEncoded}`}
            windowWidth={mobileMode ? 350 : 750}
            windowHeight={mobileMode ? 600 : 600}
            disabled={isAndroid()}
            disabledStyle={isAndroid() ? { opacity: 1 } : {}}
          >
            <div className={darkButton ? 'material_ui_dark_button' : 'material_ui_light_button'}>
              <div>
                Share on Facebook
              </div>
            </div>
          </FacebookShareButton>
          </CopyToClipboard>
        </div>
      </Wrapper>
    );
  }
}
ShareOnFacebookButton.propTypes = {
  campaignXNewsItemWeVoteId: PropTypes.string,
  campaignXWeVoteId: PropTypes.string,
  darkButton: PropTypes.bool,
  mobileMode: PropTypes.bool,
};

const styles = () => ({
});

const Wrapper = styled('div')`
  width: 100%;
  display: block;
`;

export default withStyles(styles)(ShareOnFacebookButton);
