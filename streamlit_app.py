import streamlit as st
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

def monte_carlo_pi(n_samples):
    """モンテカルロ法で円周率を推定"""
    x = np.random.uniform(0, 1, n_samples)
    y = np.random.uniform(0, 1, n_samples)
    
    # 点が円の内側にあるかチェック
    inside_circle = (x**2 + y**2) <= 1
    
    # 円周率の推定値
    pi_estimate = 4 * np.sum(inside_circle) / n_samples
    
    return x, y, inside_circle, pi_estimate

def create_plot(x, y, inside_circle):
    """プロットを作成"""
    fig = go.Figure()
    
    # 円の外側の点（青）
    outside_x = x[~inside_circle]
    outside_y = y[~inside_circle]
    fig.add_trace(go.Scatter(
        x=outside_x, y=outside_y,
        mode='markers',
        marker=dict(color='blue', size=3, opacity=0.6),
        name='円の外側',
        showlegend=True
    ))
    
    # 円の内側の点（赤）
    inside_x = x[inside_circle]
    inside_y = y[inside_circle]
    fig.add_trace(go.Scatter(
        x=inside_x, y=inside_y,
        mode='markers',
        marker=dict(color='red', size=3, opacity=0.6),
        name='円の内側',
        showlegend=True
    ))
    
    # 四分円を描画
    theta = np.linspace(0, np.pi/2, 100)
    circle_x = np.cos(theta)
    circle_y = np.sin(theta)
    fig.add_trace(go.Scatter(
        x=circle_x, y=circle_y,
        mode='lines',
        line=dict(color='black', width=2),
        name='四分円',
        showlegend=True
    ))
    
    # 正方形の枠を描画
    fig.add_trace(go.Scatter(
        x=[0, 1, 1, 0, 0], y=[0, 0, 1, 1, 0],
        mode='lines',
        line=dict(color='black', width=2),
        name='正方形',
        showlegend=True
    ))
    
    fig.update_layout(
        width=600,
        height=600,
        xaxis=dict(range=[-0.1, 1.1], title='x'),
        yaxis=dict(range=[-0.1, 1.1], title='y'),
        title='モンテカルロ法による円周率の推定',
        showlegend=True
    )
    
    return fig

# メインアプリケーション
st.title("モンテカルロ法で円周率を求めよう！")
st.caption("Created by Dit-Lab.(Daiki ITO)")
st.caption("Supported by Tomoaki ATSUMI")

# 設定エリア
st.header("⚙️ 設定")
n_samples = st.slider("試行回数を指定してください", 100, 100000, 3000, 100)

# シミュレーション実行（スライダーの値に応じて自動実行）
x, y, inside_circle, pi_estimate = monte_carlo_pi(n_samples)

# 結果の可視化
fig = create_plot(x, y, inside_circle)
st.plotly_chart(fig, use_container_width=True)

# メトリクス表示
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("全体の点の数 (N)", f"{n_samples:,}")
with col2:
    st.metric("円の内側の点の数 (n)", f"{np.sum(inside_circle):,}")
with col3:
    st.metric("計算された円周率 (π)", f"{pi_estimate:.4f}")

# 真の円周率との比較
true_pi = np.pi
error = abs(pi_estimate - true_pi)
error_percentage = (error / true_pi) * 100

st.info(f"真の円周率: {true_pi:.6f}")
st.info(f"誤差: {error:.6f} ({error_percentage:.2f}%)")

# 原理の解説
st.header("📚 モンテカルロ法とは？")
st.write("""
モンテカルロ法は、ランダムサンプリングを使って数値計算を行う手法です。
円周率の推定では、正方形内にランダムに点を打ち、その点が円の内側に入る確率を利用します。
""")

st.subheader("📐 計算原理")
st.write("""
1辺1の正方形と、原点を中心とする半径1の四分円を考えます：
""")

st.latex(r"""
\text{正方形の面積} = 1 \times 1 = 1
""")

st.latex(r"""
\text{四分円の面積} = \frac{\pi \times 1^2}{4} = \frac{\pi}{4}
""")

st.write("面積の比と点の数の比が等しくなることから：")

st.latex(r"""
\frac{\text{四分円の面積}}{\text{正方形の面積}} = \frac{\text{円の内側の点の数 } n}{\text{全体の点の数 } N}
""")

st.latex(r"""
\frac{\pi/4}{1} = \frac{n}{N}
""")

st.write("したがって、円周率の近似値は：")

st.latex(r"""
\pi \approx 4 \times \frac{n}{N}
""")

st.subheader("📈 大数の法則")
st.write("""
**試行回数（点の数）を増やせば増やすほど、計算結果は真の円周率に近づいていきます。**
これを「大数の法則」といいます。

上のスライダーで試行回数を変えて、何度もシミュレーションを実行してみてください。
試行回数が多いほど、より正確な円周率の値が得られることが確認できます。
""")

st.subheader("🎯 学習のポイント")
st.write("""
- **確率と統計**: ランダムな点の分布から確率的に円周率を求める
- **数値計算**: 解析的に解けない問題を数値的に近似する
- **大数の法則**: サンプル数を増やすことで精度が向上する
- **視覚化の重要性**: 数学的概念を視覚的に理解する
""")
