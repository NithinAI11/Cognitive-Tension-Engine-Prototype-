import numpy as np
import networkx as nx

class MathEngine:
    def __init__(self):
        self.rng = np.random.default_rng()

    def _entropy(self, pk):
        """Helper: Calculate entropy in bits."""
        pk = np.array(pk)
        pk = pk / np.sum(pk)
        pk = pk[pk > 0]
        return -np.sum(pk * np.log2(pk))

    def compute_information_gain(self, similarities: list[float]) -> float:
        """
        Calculates Information Gain based on semantic similarity.
        Uses pure numpy to avoid scipy dependency issues.
        """
        if not similarities: 
            return 0.0
        
        # 1. Prior Entropy (Binary distribution at 0.5)
        h_prior = 1.0 
        
        # 2. Compute Posterior Probabilities
        # Map Cosine Similarity (-1 to 1) to Probability (0 to 1)
        probs = []
        for sim in similarities:
            # Sigmoid map: 0.2 -> ~0.7
            p = 1 / (1 + np.exp(-4 * sim))
            probs.append(p)
            
        # 3. Compute Average Posterior Entropy
        h_posteriors = []
        for p in probs:
            p_safe = np.clip(p, 0.001, 0.999)
            # Binary entropy formula
            h = - (p_safe * np.log2(p_safe) + (1 - p_safe) * np.log2(1 - p_safe))
            h_posteriors.append(h)
            
        avg_h_posterior = np.mean(h_posteriors)
        
        return float(max(0.0, h_prior - avg_h_posterior))

    def compute_cvar(self, risk_scores: list[float], alpha: float = 0.1) -> float:
        if not risk_scores: 
            return 0.5 
            
        scores = np.array(risk_scores)
        if np.max(scores) > 1.0:
            scores = scores / 10.0
            
        mu = np.mean(scores)
        sigma = np.std(scores) if len(scores) > 1 else 0.1
        
        # Monte Carlo Simulation
        try:
            simulated_losses = self.rng.normal(mu, sigma, 2000)
            threshold_index = int(2000 * (1 - alpha))
            sorted_losses = np.sort(simulated_losses)
            worst_cases = sorted_losses[threshold_index:]
            cvar = np.mean(worst_cases)
            return float(np.clip(cvar, 0.0, 1.0))
        except Exception:
            return float(mu)

    def compute_spectral_score(self, graph_nodes: list, graph_edges: list) -> dict:
        if not graph_nodes:
            return {}
        
        # If no edges, return default small centrality
        if not graph_edges:
            return {node: 0.1 for node in graph_nodes}

        G = nx.Graph()
        G.add_nodes_from(graph_nodes)
        G.add_weighted_edges_from(graph_edges)

        try:
            centrality = nx.eigenvector_centrality_numpy(G, weight='weight')
            max_val = max(centrality.values()) if centrality else 1.0
            if max_val == 0: max_val = 1.0
            return {k: float(v / max_val) for k, v in centrality.items()}
        except Exception:
            return {node: 0.1 for node in graph_nodes}

    def compute_shapley_values(self, components_map: dict, total_scores: dict) -> dict:
        try:
            if not total_scores: return {}

            # Identify Winner
            winner_id = max(total_scores, key=total_scores.get)
            winner_comps = components_map.get(winner_id, {})
            
            if not winner_comps: 
                # Fallback: Create dummy components if missing
                return {"Utility": 0.0, "InfoGain": 0.0, "RiskPenalty": 0.0}

            # Calculate Baseline (Mean)
            keys = winner_comps.keys()
            baseline = {k: 0.0 for k in keys}
            count = len(components_map)
            
            for pid, comps in components_map.items():
                for k in keys:
                    baseline[k] += comps.get(k, 0)
            
            baseline = {k: v/count for k, v in baseline.items()}
            
            # Shapley Calculation
            shapley = {}
            for k in keys:
                shapley[k] = winner_comps[k] - baseline[k]
                
            return shapley
        except Exception as e:
            print(f"⚠️ MathEngine Shapley Error: {e}")
            return {"Error": 0.0}

math_engine = MathEngine()