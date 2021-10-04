import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, filter, first, map, switchMap, timeout } from 'rxjs/operators';
import { PolygonGasResponse } from 'src/app/core/services/gas-service/models/polygon-gas-response';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON
] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

type NetworksGasPrice<T> = Record<SupportedBlockchain, T>;

@Injectable({
  providedIn: 'root'
})
export class GasService {
  /**
   * Gas price functions for different networks.
   */
  private readonly gasPriceFunctions: NetworksGasPrice<() => Observable<number | null>>;

  /**
   * Gas price in Gwei subject.
   */
  private readonly networkGasPrice$: NetworksGasPrice<BehaviorSubject<number | null>>;

  /**
   * Gas price update interval in seconds.
   */
  private readonly requestInterval: number;

  private static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedBlockchain {
    return supportedBlockchains.some(supBlockchain => supBlockchain === blockchain);
  }

  constructor(private readonly httpClient: HttpClient) {
    this.requestInterval = 15_000;

    this.networkGasPrice$ = {
      [BLOCKCHAIN_NAME.ETHEREUM]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.POLYGON]: new BehaviorSubject(null)
    };
    this.gasPriceFunctions = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.fetchEthGas.bind(this),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.fetchBscGas.bind(this),
      [BLOCKCHAIN_NAME.POLYGON]: this.fetchPolygonGas.bind(this)
    };

    this.setIntervalOnGasPriceRefreshing();
  }

  /**
   * Gas price in Gwei for selected blockchain as observable.
   * @param blockchain Blockchain to get gas price from.
   */
  public getGasPrice$(blockchain: BLOCKCHAIN_NAME): Observable<number | null> {
    if (!GasService.isSupportedBlockchain(blockchain)) {
      throw Error('Not supported blockchain');
    }
    return this.networkGasPrice$[blockchain].asObservable();
  }

  /**
   * Gas price in Eth units for selected blockchain.
   * @param blockchain Blockchain to get gas price from.
   */
  public async getGasPriceInEthUnits(blockchain: BLOCKCHAIN_NAME): Promise<BigNumber> {
    if (!GasService.isSupportedBlockchain(blockchain)) {
      throw Error('Not supported blockchain');
    }
    return new BigNumber(
      await this.networkGasPrice$[blockchain]
        .pipe(
          filter(value => !!value),
          first()
        )
        .toPromise()
    ).dividedBy(10 ** 9);
  }

  /**
   * Updates gas price in interval.
   */
  private setIntervalOnGasPriceRefreshing(): void {
    const timer$ = timer(0, this.requestInterval);
    timer$
      .pipe(
        switchMap(() => {
          return this.gasPriceFunctions[BLOCKCHAIN_NAME.ETHEREUM]();
        })
      )
      .subscribe((ethGasPrice: number | null) => {
        if (ethGasPrice) {
          this.networkGasPrice$[BLOCKCHAIN_NAME.ETHEREUM].next(ethGasPrice);
        }
      });
  }

  /**
   * Gets ETH gas from different APIs, sorted by priority, in case of errors.
   * @return Observable<number> Average gas price.
   */
  private fetchEthGas(): Observable<number | null> {
    const requestTimeout = 2000;
    return this.httpClient.get('https://www.gasnow.org/api/v3/gas/price').pipe(
      timeout(requestTimeout),
      map((response: { data: { fast: string } }) =>
        new BigNumber(response.data.fast)
          .dividedBy(10 ** 9)
          .dp(0)
          .toNumber()
      ),
      catchError(() =>
        this.httpClient.get('https://gas-price-api.1inch.io/v1.2/1').pipe(
          timeout(requestTimeout),
          map((response: { medium: { maxFeePerGas: string } }) =>
            new BigNumber(response.medium.maxFeePerGas)
              .dividedBy(10 ** 9)
              .dp(0)
              .toNumber()
          )
        )
      ),
      catchError(() =>
        this.httpClient.get('https://ethgasstation.info/api/ethgasAPI.json').pipe(
          timeout(requestTimeout),
          map((response: { average: number }) => response.average / 10)
        )
      ),
      catchError(() => of(null))
    );
  }

  /**
   * Gets BSC gas.
   * @return Observable<number> Average gas price.
   */
  private fetchBscGas(): Observable<number> {
    return of(5);
  }

  /**
   * Gets Polygon gas from gas station api.
   * @return Observable<number> Average gas price.
   */
  private fetchPolygonGas(): Observable<number | null> {
    return this.httpClient.get('https://gasstation-mainnet.matic.network/').pipe(
      map((el: PolygonGasResponse) => Math.floor(el.standard)),
      catchError(() => of(null))
    );
  }
}
