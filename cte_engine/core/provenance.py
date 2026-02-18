from core.math_engine import math_engine

class ProvenanceEngine:
    def generate_provenance(self, plans_with_scores: list):
        """
        Generates Shapley attribution.
        """
        # 1. Define a robust fallback that allows the UI to render zero-values
        # instead of an empty state.
        fallback_drivers = [
            ("Utility", 0.0), 
            ("InfoGain", 0.0), 
            ("RiskPenalty", 0.0),
            ("Spectral", 0.0)
        ]
        
        default_resp = {
            "winner_id": "Unknown", 
            "winner_perspective": "System",
            "drivers": fallback_drivers,
            "shapley_attribution": {"Utility": 0.0}
        }

        if not plans_with_scores:
            return default_resp

        try:
            # 2. Extract Scores safely
            components_map = {}
            total_scores = {}
            
            for p in plans_with_scores:
                # Ensure score_data exists
                s_data = p.get('score_data')
                if s_data and 'components' in s_data:
                    components_map[p['id']] = s_data['components']
                    total_scores[p['id']] = s_data['total']
            
            if not total_scores:
                print("⚠️ Provenance: No scores found in plans.")
                return default_resp

            # 3. Find Winner
            winner_id = max(total_scores, key=total_scores.get)
            winner_plan = next((p for p in plans_with_scores if p['id'] == winner_id), None)
            winner_role = winner_plan['perspective'] if winner_plan else "Unknown"

            # 4. Compute Shapley
            shapley = math_engine.compute_shapley_values(components_map, total_scores)
            
            # 5. Format Drivers
            if shapley:
                drivers = sorted(shapley.items(), key=lambda x: abs(x[1]), reverse=True)
            else:
                drivers = fallback_drivers
            
            return {
                "winner_id": winner_id,
                "winner_perspective": winner_role,
                "shapley_attribution": shapley,
                "drivers": drivers
            }
        except Exception as e:
            print(f"❌ Provenance Engine Failed: {e}")
            return default_resp

provenance_engine = ProvenanceEngine()