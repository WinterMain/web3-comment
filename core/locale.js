const allLang = {
  en_US: {
    discussTip: 'Your comments will be submitted to the blockchain',
    discussInputTitle: "Comment",
    discussInputName: "Your name",
    discussInputNameTip: "Please enter your name",
    discussInputCommentPlaceholder: "Please enter comment...",
    discussInputCommentTip: "Please enter comment",
    discussInputComment: "Submit",
    discussSubmitting: 'Your comment is being submitted to the blockchain...',
    discussBtnSubmit: 'Submit',
    discussMetaMaskBtnSubmit: 'MetaMask Submit',
    discussEmptyTip: 'Comments on the blockchain are empty, so go ahead and submit one',
    discussSubmitError: 'Failed to submit, please try again later!',
    discussComingSoon: 'Coming soon, stay tuned!',
    submitSuccessfully: 'Submit successfully',
    totalTitle: '[num] comments in total',
    txhash: 'Tx hash: ',
    coinExChainTest: 'CoinEx(Testnet)',
    testnet: 'Testnet',
    metamaskConnectedStr: 'MetaMask connected',
    coinExChainMain: 'CoinEx Smart Chain',
    confirm: 'Confirm',
    cancel: 'Cancel',
    notSupportNetTitle: 'Network is not supported',
    notSupportNetMsg: 'Your current MetaMask network is not currently supported, you can click the button below to switch or add a network.',
    noMetaMask: 'MetaMask not found',
    noMetaMaskMsg: 'Please enable MetaMask in the plugin, if not installed, click the button below to install',
    goAndInstallMetaMask: 'Install MetaMask'
  },
  zh_Hans_CN: {
    discussTip: '您的评论将提交至区块链中，开启Web3的大门。',
    discussInputTitle: "评论",
    discussInputName: "您的称呼",
    discussInputNameTip: "请输入称呼",
    discussInputCommentPlaceholder: "请输入评论...",
    discussInputCommentTip: "请输入评论",
    discussInputComment: "提交",
    discussSubmitting: '您的评论正提交至区块链中...',
    discussBtnSubmit: '提交',
    discussMetaMaskBtnSubmit: 'MetaMask提交',
    discussEmptyTip: '区块链上的评论空空如也，快去提交一个吧',
    discussSubmitError: '提交失败，请稍后重试!',
    discussComingSoon: '即将上线，敬请期待！',
    submitSuccessfully: '提交成功',
    totalTitle: '共[num]条评论',
    txhash: '交易哈希：',
    coinExChainTest: 'CoinEx智能链(测试网)',
    testnet: '测试网',
    metamaskConnectedStr: 'MetaMask已连接',
    coinExChainMain: 'CoinEx智能链',
    confirm: '确定',
    cancel: '取消',
    notSupportNetTitle: '不支持当前网络',
    notSupportNetMsg: '您当前MetaMask的网络暂不支持，可以点击下面按钮切换或添加网络。',
    noMetaMask: '未找到MetaMask',
    noMetaMaskMsg: '请在插件中启用MetaMask，如未安装则可点击下面按钮去安装',
    goAndInstallMetaMask: '去安装MetaMask'
  },
  zh_Hant_HK: {
    discussTip: '您的評論將提交至區塊鏈中，開啟Web3的大門。',
    discussInputTitle: "評論",
    discussInputName: "您的稱呼",
    discussInputNameTip: "請輸入稱呼",
    discussInputCommentPlaceholder: "請輸入評論...",
    discussInputCommentTip: "請輸入評論",
    discussInputComment: "提交",
    discussSubmitting: '您的評論正提交至區塊鏈中...',
    discussBtnSubmit: '提交',
    discussMetaMaskBtnSubmit: 'MetaMask提交',
    discussEmptyTip: '區塊鏈上的評論空空如也，快去提交一個吧',
    discussSubmitError: '提交失敗，請稍後重試!',
    discussComingSoon: '即將上線，敬請期待！',
    submitSuccessfully: '提交成功',
    totalTitle: '共[num]條評論',
    txhash: '交易哈希：',
    coinExChainTest: 'CoinEx智能鏈(測試網)',
    testnet: '測試網',
    metamaskConnectedStr: 'MetaMask已連接',
    coinExChainMain: 'CoinEx智能鏈',
    confirm: '確定',
    cancel: '取消',
    notSupportNetTitle: '不支持當前網絡',
    notSupportNetMsg: '您當前MetaMask的網絡暫不支持，可以點擊下面按鈕切換或添加網絡。',
    noMetaMask: '未找到MetaMask',
    noMetaMaskMsg: '請在插件中啟用MetaMask，如未安裝則可點擊下面按鈕去安裝',
    goAndInstallMetaMask: '去安裝MetaMask'
  },
};
const defaultLang = 'zh_Hans_CN';

export function getLocale(field) {
  const config = window.blockCommentOptions || {};
  const configLocale = config.locale || {};
  const lang = Object.keys(allLang).includes(config.lang) ? config.lang : 'zh_Hans_CN';
  const langDict = allLang[lang];

  if (typeof configLocale[field] === 'undefined') {
    return typeof langDict[field] === 'undefined' ? allLang[defaultLang][field] : langDict[field];
  } else {
    return configLocale[field];
  }
}
