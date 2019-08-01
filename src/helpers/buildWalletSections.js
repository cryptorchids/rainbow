import lang from 'i18n-js';
import { findIndex, get } from 'lodash';
import React from 'react';
import { withNavigation } from 'react-navigation';
import { compose, withHandlers } from 'recompact';
import { createSelector } from 'reselect';
import FastImage from 'react-native-fast-image';
import { BalanceCoinRow } from '../components/coin-row';
import { UniswapInvestmentCard } from '../components/investment-cards';
import { TokenFamilyWrap } from '../components/token-family';
import { buildUniqueTokenList, buildCoinsList } from './assets';

const allAssetsSelector = state => state.allAssets;
const allAssetsCountSelector = state => state.allAssetsCount;
const assetsSelector = state => state.assets;
const assetsTotalSelector = state => state.assetsTotal;
const languageSelector = state => state.language;
const nativeCurrencySelector = state => state.nativeCurrency;
const setIsWalletEmptySelector = state => state.setIsWalletEmpty;
const shitcoinsCountSelector = state => state.shitcoinsCount;
const uniqueTokensSelector = state => state.uniqueTokens;
const uniswapSelector = state => state.uniswap;
const uniswapTotalSelector = state => state.uniswapTotal;

const enhanceRenderItem = compose(
  withNavigation,
  withHandlers({
    onPress: ({ assetType, navigation }) => (item) => {
      navigation.navigate('ExpandedAssetScreen', {
        asset: item,
        type: assetType,
      });
    },
    onPressSend: ({ navigation }) => (asset) => {
      navigation.navigate('SendSheet', { asset });
    },
  }),
);

const TokenItem = enhanceRenderItem(BalanceCoinRow);
const UniswapCardItem = enhanceRenderItem(UniswapInvestmentCard);

const balancesRenderItem = item => <TokenItem {...item} assetType="token" />;
const tokenFamilyItem = item => <TokenFamilyWrap {...item} />;
const uniswapRenderItem = item => <UniswapCardItem {...item} assetType="uniswap" isCollapsible={true} />;

const filterWalletSections = sections => (
  sections.filter(({ data, header }) => (
    data
      ? get(header, 'totalItems')
      : true
  ))
);

const buildWalletSections = (
  allAssets,
  allAssetsCount,
  assets,
  assetsTotal,
  language,
  nativeCurrency,
  setIsWalletEmpty,
  shitcoinsCount,
  uniqueTokens = [],
  uniswap = [],
  uniswapTotal,
) => {
  const sections = [
    {
      balances: true,
      data: buildCoinsList(allAssets),
      header: {
        title: lang.t('account.tab_balances'),
        totalItems: allAssetsCount,
        totalValue: get(assetsTotal, 'display', ''),
      },
      name: 'balances',
      renderItem: balancesRenderItem,
    },
    {
      data: uniswap,
      header: {
        title: 'Investments',
        totalItems: uniswap.length,
        totalValue: uniswapTotal,
      },
      investments: true,
      name: 'investments',
      renderItem: uniswapRenderItem,
    },
    {
      collectibles: true,
      data: buildUniqueTokenList(uniqueTokens),
      header: {
        title: lang.t('account.tab_collectibles'),
        totalItems: uniqueTokens.length,
        totalValue: '',
      },
      name: 'collectibles',
      renderItem: tokenFamilyItem,
      type: 'big',
    },
  ];

  const imageTokens = [];
  uniqueTokens.forEach(token => {
    if (token.image_preview_url) {
      imageTokens.push({
        uri: token.image_preview_url,
        id: token.id
      });
    }
  });

  FastImage.preload(imageTokens);

  const filteredSections = filterWalletSections(sections);
  const isEmpty = !filteredSections.length;

  // Save wallet empty status to state
  setIsWalletEmpty(isEmpty);

  return {
    isEmpty,
    sections: filteredSections,
  };
};

export default createSelector(
  [
    allAssetsSelector,
    allAssetsCountSelector,
    assetsSelector,
    assetsTotalSelector,
    languageSelector,
    nativeCurrencySelector,
    setIsWalletEmptySelector,
    shitcoinsCountSelector,
    uniqueTokensSelector,
    uniswapSelector,
    uniswapTotalSelector,
  ],
  buildWalletSections,
);
