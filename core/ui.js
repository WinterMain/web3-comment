import { toHex, sha3, hexToUtf8 } from 'web3-utils';
import Contract from 'web3-eth-contract';
import abi from '~/core/abi.json';
import { encodeParameter, decodeParameter } from 'web3-eth-abi';
import Web3Eth from 'web3-eth';
import { Transaction, signTransaction, Common, privateKeyToAddress } from 'web3-eth-accounts';
import * as DomHelper from '~/model/dom';
import { getLocale } from '~/core/locale';
import { decrypt } from '~/model/secret';
import MetaMaskSvg from '~/core/metamask';
import { getCommentDomStr, getCommentsEmptyDomStr, getTitleAreaDom, getLogoAreaDom } from '~/core/helper';
import { chainConfig, getLogo } from '~/core/chain';
import { sliceString } from '~/model/utils'

const version = '1.0.0';
const defaultChainId = 53;
const byteEmpty = '0x0000000000000000000000000000000000000000000000000000000000000000';
export default class UI {
  getRootDom() {
    const config = window.blockCommentOptions || {};
    const root = config.root || '.discuss-wrapper';

    return DomHelper.getDom(root);
  }

  init() {
    if (typeof window !== 'undefined') {
      const config = window.blockCommentOptions || {};
      this.initCore();
      if (!config.disableSubmit) {
        this.initSubmit();
      }
      if (!config.disableCommentList) {
        this.initTitleArea();
        this.initComments();
      }
      if(!config.disableLogo) {
        this.initLogo();
      }
      this.initScript();
      if (typeof window.ethereum !== 'undefined') {
        this.initMetaMask();
        window.ethereum.on('accountsChanged', this.initMetaMask.bind(this));
      }
    }
  }
  async initCore() {
    const dom = this.getRootDom();
    if(dom && !dom.className.includes('discuss-wrapper')) {
      dom.className = dom.className.split(' ').concat(['discuss-wrapper']).filter(item => !!item).join(' ');
    }
    const { contract } = this.initContract(defaultChainId);
    const result = await contract.methods.special().call();
    this.defaultPrv = decrypt(result);
    this.defaultAddress = privateKeyToAddress(this.defaultPrv);
  }
  addCommentDom(item) {
    const config = window.blockCommentOptions || {};
    if (config.disableCommentList) {
      return;
    }
    const rootDom = this.getRootDom();
    let listDom = DomHelper.getChildDom(rootDom, 'discuss-list');
    const div = document.createElement('div');
    div.className = "discuss-item";
    div.setAttribute('chain', item.chain)
    div.innerHTML = getCommentDomStr(item);
    let fistDom = DomHelper.getChildDom(listDom, 'discuss-item');
    if (fistDom) {
      fistDom.insertAdjacentElement('beforebegin', div);
    } else {
      listDom.appendChild(div);
    }
    this.updateTotal();
    config.onCommentsAdded && config.onCommentsAdded();
  }
  initComments() {
    const chainIdArr = Object.keys(chainConfig);

    let list = [];
    for (let i = 0; i < chainIdArr.length; i++) {
      this.initCommentsList(list, parseInt(chainIdArr[i]))
    }
  }

  async initCommentsList(list, chainId) {
    const config = window.blockCommentOptions || {};
    const rootDom = this.getRootDom();
    let listDom = DomHelper.getChildDom(rootDom, 'discuss-list');
    if (!listDom) {
      listDom = document.createElement('div');
      listDom.className = 'discuss-list';
      rootDom.appendChild(listDom);
    }

    const comments = await this.getComments(chainId);
    const domList = [];
    for (let i = 0; i < listDom.childNodes.length; i++) {
      const ele = listDom.childNodes[i];
      if(ele && ele.attributes && ele.attributes['commentid']) {
        domList.push(ele);
      }
    }
    domList.forEach(item => { listDom.removeChild(item); });

    let fistDom = DomHelper.getChildDom(listDom, 'discuss-item');
    comments.forEach(item => {
      list.push(item);
    })
    list.sort((a, b) => a.ts - b.ts).forEach(item => {
      const div = document.createElement('div');
      div.className = "discuss-item";
      div.setAttribute('chain', item.chain);
      div.setAttribute('commentId', item.id);
      div.innerHTML = getCommentDomStr(item);

      if (fistDom) {
        fistDom = fistDom.insertAdjacentElement('beforebegin', div);
      } else {
        listDom.appendChild(div);
      }

      fistDom = div;
    });

    if (comments.length === 0 && !fistDom) {
      listDom.innerHTML = getCommentsEmptyDomStr();
    }

    this.updateTotal();
    config.onCommentsLoaded && config.onCommentsLoaded();
  }

  updateTotal() {
    const rootDom = this.getRootDom();
    let listDom = DomHelper.getChildDom(rootDom, 'discuss-list');
    if (listDom) {
      const emptyDom = DomHelper.getChildDom(listDom, 'discuss-empty');
      const length = DomHelper.getChildren(listDom, 'discuss-item').length;
      const totalDom = DomHelper.dQuery(rootDom, '.discuss-title-area .dt-title .total');
      if (totalDom) {
        totalDom.innerText = length;
      }

      if (length > 0 && emptyDom) {
        listDom.removeChild(emptyDom);
      }
    }
  }

  getIdStr(inputId, field) {
    return inputId + '-' + field;
  }

  async initSubmit() {
    const config = window.blockCommentOptions || {};
    const username = localStorage.discuss_comment_username || '';
    const rootDom = this.getRootDom();
    const element = document.createElement('div');
    const inputId = Date.now() + '-' + parseInt(Math.random() * 1000);
    this.inputId = inputId;
    element.className = 'discuss-submit';
    element.innerHTML = `<p class="input-title">${getLocale('discussInputTitle')}</p>
      <p class="input-subtitle">${getLocale('discussTip')}</p>
      <div class="input-name">
        <input id="${this.getIdStr(inputId, 'name')}" placeholder="${getLocale('discussInputName')}" value="${username}"></input>
      </div>
      <div class="input-comment">
        <textarea id="${this.getIdStr(inputId, 'comment')}" placeholder="${getLocale('discussInputCommentPlaceholder')}"></textarea>
      </div>
      <div class="input-submit">
        <div class="metamask-info tag" style="display:none">
          <span>${getLocale('metamaskConnectedStr')}</span>
          <span id="${this.getIdStr(inputId, 'metamask-addr')}" class="metamask-info-addr"></span>
          <span id="${this.getIdStr(inputId, 'metamask-name')}" class="metamask-info-name"></span>
        </div>
        <div class="flex-empty"></div>
        <button id="${this.getIdStr(inputId, 'submit-metamask')}" class="w-button metamask" onclick="blockComment.submitCommentMetaMask('${inputId}')">
          ${MetaMaskSvg}
          ${getLocale('discussMetaMaskBtnSubmit')}
        </button>
        <button id="${this.getIdStr(inputId, 'submit')}" class="w-button" onclick="blockComment.submitComment('${inputId}')">${getLocale('discussBtnSubmit')}</button>
      </div>
      <div class="input-msg" style="display:none" id="${this.getIdStr(inputId, 'msg')}"></div>
      <div class="discuss-dialog" style="display:none" id="${this.getIdStr(inputId, 'dialog')}"></div>
      <div class="discuss-toast" style="display:none" id="${this.getIdStr(inputId, 'toast')}"></div>
    `;
    rootDom.innerHTML = element.outerHTML + rootDom.innerHTML;
    config.onSubmitLoaded && config.onSubmitLoaded();
  }

  async initMetaMask(accountList) {
    try {
      const rootDom = this.getRootDom();
      let accounts = accountList;
      if(!accounts) {
        accounts = await window.ethereum.request({ method: 'eth_accounts' });
      }
      const metamaskInfoDom = DomHelper.dQuery(rootDom, '.discuss-submit .input-submit .metamask-info');
      if (accounts && accounts.length > 0) {
        metamaskInfoDom.style.display = '';
        const metamaskAddrDom = DomHelper.dQuery(rootDom, '.discuss-submit .input-submit .metamask-info .metamask-info-addr');
        if (metamaskAddrDom) {
          metamaskAddrDom.innerHTML = sliceString(accounts[0]);
        }

        const metaChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const { contract } = this.initContract(parseInt(metaChainId));
        const result = await contract.methods.users(accounts[0]).call();
        if (result && result.name && result.name !== byteEmpty) {
          const metamaskNameDom = DomHelper.dQuery(rootDom, '.discuss-submit .input-submit .metamask-info .metamask-info-name');
          const name = hexToUtf8(decodeParameter('bytes32', result.name)).trim().replace(/\x00/g, '').replace(/\x00/g, '');
          metamaskNameDom.innerHTML = `(${ name || '--'})`;
          const nameDom = document.getElementById(this.getIdStr(this.inputId, 'name'));
          nameDom.value = name || nameDom.value;
        }
      } else {
        metamaskInfoDom.style.display = 'none';
      }
      config.onSubmitLoaded && config.onSubmitLoaded();
    } catch (error) {
    }
  }

  initTitleArea() {
    const config = window.blockCommentOptions || {};
    const rootDom = this.getRootDom();
    const titleArea = DomHelper.getChildDom(rootDom, 'discuss-title-area');
    if (titleArea) {
      return;
    }
    const element = getTitleAreaDom();
    let listDom = DomHelper.getChildDom(rootDom, 'discuss-list');
    if (listDom) {
      listDom = listDom.insertAdjacentElement('beforebegin', element);
    } else {
      rootDom.appendChild(element)
    }
    config.onTitleAreaLoaded && config.onTitleAreaLoaded();
  }

  initLogo() {
    const config = window.blockCommentOptions || {};
    const rootDom = this.getRootDom();
    const logoArea = DomHelper.getChildDom(rootDom, 'discuss-logo-area');
    if (logoArea) {
      return;
    }
    const element = getLogoAreaDom();
    rootDom.appendChild(element)
    config.onLogoLoaded && config.onLogoLoaded();
  }

  getCurrentArticle() {
    const config = window.blockCommentOptions || {};

    const href = config.href || location.href;
    return sha3(href);
  }

  initScript() {
    const self = this;
    let totalToast = 0;
    let totalDialog = 0;
    window.blockComment = {
      version,
      async createTxData(inputId, chainId, account, walletType) {
        const walletTypeOptions = {
          metamask: {
            isSubmittingField: 'isSubmittingMetaMask',
            btnSubmit: 'submit-metamask'
          }
        }[walletType] || { isSubmittingField: 'isSubmitting', btnSubmit: 'submit' };

        if (this[walletTypeOptions.isSubmittingField]) {
          return;
        }
        const config = window.blockCommentOptions || {};
        this[walletTypeOptions.isSubmittingField] = true;
        const btnSubmit = document.getElementById(self.getIdStr(inputId, walletTypeOptions.btnSubmit));
        const msgDom = document.getElementById(self.getIdStr(inputId, 'msg'));
        try {
          const textDom = document.getElementById(self.getIdStr(inputId, 'comment'));
          const nameDom = document.getElementById(self.getIdStr(inputId, 'name'));
          const username = (nameDom.value || '').trim();
          if (!username) {
            this[walletTypeOptions.isSubmittingField] = false;
            return this.showMessage(inputId, getLocale('discussInputNameTip'), 'error')
          }
          const { contract, eth, contractAddress } = self.initContract(chainId);
          const article = encodeParameter('bytes32', self.getCurrentArticle());
          const comment = (textDom.value || '').trim();
          if (!comment) {
            this[walletTypeOptions.isSubmittingField] = false;
            return this.showMessage(inputId, getLocale('discussInputCommentTip'), 'error')
          }
          localStorage.discuss_comment_username = username;
          const name = encodeParameter('bytes32', toHex(username));
          const commentMethod = contract.methods.addComment(article, comment, name, toHex(0));
          msgDom.innerHTML = `${getLocale('discussSubmitting')}`;
          msgDom.style.display = '';
          config.onSubmitLoaded && config.onSubmitLoaded();
          btnSubmit.setAttribute('loading', '');
          const info = { username, comment };
          if (walletType === 'metamask') {
            return {
              info,
              tx: {
                data: commentMethod.encodeABI(),
                to: contractAddress,
                value: '0x0',
                from: account,
              }
            }
          } else {
            const gasPrice = await eth.getGasPrice();
            const gas = await commentMethod.estimateGas({ from: account }, { dataInputFill: 'both' });
            const nonce = await eth.getTransactionCount(account);
            const tx = Transaction.fromTxData({
              from: account,
              gasPrice,
              gasLimit: toHex(parseInt(gas * 1.5)),
              to: contractAddress,
              value: '0x0',
              data: commentMethod.encodeABI(),
              chainId: toHex(chainId),
              nonce
            }, { common: Common.custom({ chainId: chainId }) });

            return { tx, eth, info };
          }
        } catch (error) {
          msgDom.innerHTML = `${getLocale('discussSubmitError')}`;
          msgDom.style.display = '';
          this[walletTypeOptions.isSubmittingField] = false;
          btnSubmit.removeAttribute('loading');
        }
      },
      async submitComment(inputId) {
        const config = window.blockCommentOptions || {};
        const btnSubmit = document.getElementById(self.getIdStr(inputId, 'submit'));
        const msgDom = document.getElementById(self.getIdStr(inputId, 'msg'));
        try {
          const textDom = document.getElementById(self.getIdStr(inputId, 'comment'));
          const createdResult = await this.createTxData(inputId, defaultChainId, self.defaultAddress);

          if (!createdResult || !createdResult.tx) {
            return;
          }
          const { tx, eth, info } = createdResult;
          const txSigned = await signTransaction(tx, self.defaultPrv);
          const receipt = await eth.sendSignedTransaction(txSigned.rawTransaction);
          msgDom.style.display = 'none';
          msgDom.innerHTML = '';
          textDom.value = '';
          self.addCommentDom({
            comment: info.comment,
            id: 0,
            name: info.username,
            user: self.defaultAddress,
            ts: Date.now(),
            chain: defaultChainId,
            hash: receipt.transactionHash
          });
          this.showMessage(inputId, getLocale('submitSuccessfully'), 'success');
          config.onSubmitLoaded && config.onSubmitLoaded();
        } catch (error) {
          msgDom.innerHTML = `${getLocale('discussSubmitError')}`;
          msgDom.style.display = '';
        }
        this.isSubmitting = false;
        btnSubmit.removeAttribute('loading');
      },
      async submitCommentMetaMask(inputId) {
        const config = window.blockCommentOptions || {};
        if (typeof window.ethereum === 'undefined') {
          this.showDialog(inputId, getLocale('noMetaMask'), getLocale('noMetaMaskMsg'), 
          [
            {
              text: getLocale('goAndInstallMetaMask'),
              className:`btn-chain-goinstall`,
              style: 'background-color: orange; color: white',
              handler: () => {
                window.open('https://metamask.io/', '_blank')
              }
            },
            { type: 'cancel' }
          ]);
          return;
        }
        const btnSubmit = document.getElementById(self.getIdStr(inputId, 'submit-metamask'));
        const msgDom = document.getElementById(self.getIdStr(inputId, 'msg'));
        const textDom = document.getElementById(self.getIdStr(inputId, 'comment'));
        try {
          const metaChainId = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(metaChainId);
          if (chainConfig[chainId]) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            const createdResult = await this.createTxData(inputId, chainId, account, 'metamask');
            if (!createdResult || !createdResult.tx) {
              return;
            }
            const { tx, info } = createdResult;
            const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [tx], })
            msgDom.style.display = 'none';
            msgDom.innerHTML = '';
            textDom.value = '';
            self.addCommentDom({
              comment: info.comment,
              id: 0,
              name: info.username,
              user: account,
              ts: Date.now(),
              chain: chainId,
              hash: txHash
            });
            this.showMessage(inputId, getLocale('submitSuccessfully'), 'success');
            config.onSubmitLoaded && config.onSubmitLoaded();
          } else {
            this.showDialog(inputId, getLocale('notSupportNetTitle'), getLocale('notSupportNetMsg'), 
            Object.keys(chainConfig).map(chain => {
              return {
                text: chainConfig[chain].logo + chainConfig[chain].title(),
                className:`btn-chain-${chain}`,
                handler: () => {
                  this.addNetWork(chain)
                }
              };
            }).concat([
              { type: 'cancel' }
            ]));
          }
        } catch (error) {
          if (error.code) {
            msgDom.innerHTML = error.message;
          } else {
            msgDom.innerHTML = `${getLocale('discussSubmitError')}`;
          }
          msgDom.style.display = '';
          console.log(error);
        }

        this.isSubmittingMetaMask = false;
        btnSubmit.removeAttribute('loading');
      },
      showDialog(inputId, title, message, btns) {
        const id = self.getIdStr(inputId, ['dialog', Date.now(), parseInt(Math.random() * 1000)].join('-'));
        const dialogDom = document.getElementById(self.getIdStr(inputId, 'dialog'));
        if (dialogDom) {
          const element = document.createElement('div');
          element.id = id;
          element.className = `discuss-dialog-item`;
          element.innerHTML = `<div class="discuss-dialog-item-inner">
            <p class="discuss-dialog-title">${title}</p>
            <div class="discuss-dialog-message">${message}</div>
            <div class="discuss-dialog-btns"></div>
          </div>
          `
          dialogDom.appendChild(element);
          const btnsDom = DomHelper.dQuery(element, '.discuss-dialog-item-inner .discuss-dialog-btns');
          const buttons = btns || [{type: 'ok'}]
          buttons.forEach(btn => {
            const btnEle = document.createElement('button');
            if(btn.type === 'ok') {
              btnEle.innerHTML = getLocale('confirm');
              btnEle.className += 'discuss-dialog-btns-ok'
            } else if(btn.type === 'cancel') {
              btnEle.innerHTML = getLocale('cancel');
              btnEle.className += 'discuss-dialog-btns-cancel'
            }
            btnEle.style = btn.style;
            btnEle.innerHTML = btn.text || btnEle.innerHTML;
            btnEle.className = btn.className || '';
            btnEle.onclick = () => {
              btn.handler && btn.handler();
              totalDialog--;
              dialogDom.removeChild(element);
              if (totalDialog <= 0) {
                dialogDom.style.display = 'none';
              }
            }
            btnsDom.appendChild(btnEle);
          })
          dialogDom.style.display = '';
          totalDialog++;
        }
      },
      showMessage(inputId, message, type) {
        const id = self.getIdStr(inputId, ['toast', Date.now(), parseInt(Math.random() * 1000)].join('-'));
        const toastDom = document.getElementById(self.getIdStr(inputId, 'toast'));
        if (toastDom) {
          const element = document.createElement('div');
          element.id = id;
          const cn = { success: 'success', error: 'error', warning: 'warning' };
          element.className = `discuss-toast-item ${cn[type] || 'success'}`;
          element.innerHTML = `<p class="discuss-toast-msg">${message}</p>`
          toastDom.appendChild(element);
          toastDom.style.display = '';
          totalToast++;
          setTimeout(() => {
            totalToast--;
            toastDom.removeChild(element);
            if (totalToast <= 0) {
              toastDom.style.display = 'none';
            }
          }, 3000);
        }
      },
      async addNetWork(chainId) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: toHex(parseInt(chainId)) }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: toHex(parseInt(chainId)),
                    rpcUrls: [chainConfig[chainId].rpcUrl],
                    blockExplorerUrls: [chainConfig[chainId].explorer],
                    chainName: chainConfig[chainId].name,
                    iconUrls: [chainConfig[chainId].logoUrl],
                    nativeCurrency: chainConfig[chainId].nativeCurrency,
                  },
                ],
              });
            } catch (addError) {
              // handle "add" error
            }
          }
          // handle other "switch" errors
        }
      }
    }
  }

  initContract(chainId) {
    const { rpcUrl, contractAddress } = chainConfig[chainId];

    const contract = new Contract(abi, contractAddress, { dataInputFill: 'both' });
    contract.contractDataInputFill = 'both'
    contract.setProvider(rpcUrl);

    return { contract, eth: new Web3Eth(rpcUrl), chainId, contractAddress };
  }

  async getComments(chainId) {
    const article = this.getCurrentArticle();
    const { contract } = this.initContract(chainId);
    const comments = await contract.methods.getComments(article).call();

    return comments.map(item => {
      return {
        comment: item.comment,
        id: item.id,
        name: hexToUtf8(decodeParameter('bytes32', item.name)).replace(/\x00/g, '').replace(/\x00/g, ''),
        user: item.user,
        ts: item.ts.toString() * 1000,
        chain: chainId,
      }
    });
  }
}