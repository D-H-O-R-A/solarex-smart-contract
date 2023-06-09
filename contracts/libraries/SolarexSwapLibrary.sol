pragma solidity >=0.5.0;

import '../interfaces/ISolarexSwapFactory.sol';
import '../interfaces/ISolarexSwapPair.sol';
import "./SafeMath.sol";

library SolarexSwapLibrary {
    using SafeMath for uint;

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'N');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'Z');
    }

    // fetches pair address by token addresses
    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        pair = ISolarexSwapFactory(factory).getPair(tokenA, tokenB);
    }

    // fetches swap fee for a pair
    function getSwapFee(address factory, address tokenA, address tokenB) internal view returns (uint swapFee) {
        swapFee = ISolarexSwapPair(pairFor(factory, tokenA, tokenB)).getSwapFee();
    }

    // fetches and sorts the reserves for a pair
    function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        (uint reserve0, uint reserve1) = ISolarexSwapPair(pairFor(factory, tokenA, tokenB)).getReservesSimple();
        (reserveA, reserveB) = tokenA < tokenB ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function getReservesAndSwapFee(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB, uint swapFee) {
        ISolarexSwapPair pair = ISolarexSwapPair(pairFor(factory, tokenA, tokenB));
        (uint reserve0, uint reserve1) = pair.getReservesSimple();
        (reserveA, reserveB, swapFee) = tokenA < tokenB ? (reserve0, reserve1, pair.getSwapFee()) : (reserve1, reserve0, pair.getSwapFee());
    }

    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
        require(amountA != 0, 'N');
        require(reserveA != 0 && reserveB != 0, 'L');
        amountB = amountA.mul(reserveB) / reserveA;
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut, uint swapFee) internal pure returns (uint amountOut) {
        require(amountIn != 0, 'I');
        require(reserveIn != 0 && reserveOut != 0, 'L');
        uint amountInWithFee = amountIn.mul(uint(1e6).sub(swapFee));
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(1e6).add(amountInWithFee);
        amountOut = numerator / denominator;
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut, uint swapFee) internal pure returns (uint amountIn) {
        require(amountOut != 0, 'O');
        require(reserveIn != 0 && reserveOut != 0, 'L');
        uint numerator = reserveIn.mul(amountOut).mul(1e6);
        uint denominator = reserveOut.sub(amountOut).mul(uint(1e6).sub(swapFee));
        amountIn = (numerator / denominator).add(1);
    }

    // performs chained getAmountOut calculations on any number of pairs
    function getAmountsOut(address factory, uint amountIn, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, 'P');
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for (uint i; i < path.length - 1; ++i) {
            (uint reserveIn, uint reserveOut, uint swapFee) = getReservesAndSwapFee(factory, path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut, swapFee);
        }
    }

    // performs chained getAmountIn calculations on any number of pairs
    function getAmountsIn(address factory, uint amountOut, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, 'P');
        amounts = new uint[](path.length);
        amounts[amounts.length - 1] = amountOut;
        for (uint i = path.length - 1; i != 0; i--) {
            (uint reserveIn, uint reserveOut, uint swapFee) = getReservesAndSwapFee(factory, path[i - 1], path[i]);
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut, swapFee);
        }
    }
}
